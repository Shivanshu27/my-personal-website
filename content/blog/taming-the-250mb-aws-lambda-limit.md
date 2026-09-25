---
title: "Taming the 250MB AWS Lambda Limit: Dependency Surgery, BuildKit SSH Mounts, and a CI Gate That Caught Me 2.8MB Over"
date: 2026-09-22T10:00:00+05:30
draft: false
tags: ["aws", "lambda", "serverless", "python", "docker", "devops", "security", "ci-cd"]
categories: ["system-design", "engineering"]
---

AWS Lambda gives your function code plus all of its layers exactly **250 MB
unzipped** (262,144,000 bytes). A computer-vision inference stack goes
through that without trying:

```text
pip install opencv-python-headless numpy pillow onnxruntime  (+ what real projects drag in)
        │
        ▼
494 MB unzipped  ──►  "Unzipped size must be smaller than 262144000 bytes"
```

I first hit this wall at work, on a PyTorch and OpenCV service with private
dependencies. I can't share that code, so I rebuilt the technique in public:
**[github.com/Shivanshu27/lambda-layer-squeeze](https://github.com/Shivanshu27/lambda-layer-squeeze)**.
Every number in this post comes from that repository's CI logs. You can
clone it and get the same results.

**The result: 494 MB → 230 MB, verified inside the real Lambda runtime
image, with CI failing the build if it ever goes over 250 MB.** That gate
has already fired once, and the story of why is the most useful part of
this post.

---

## 1. The limits, precisely

| Limit | Value |
|---|---|
| Function code **+ all layers**, unzipped | **250 MB** (262,144,000 bytes) |
| Zip uploaded directly through the API | 50 MB (larger zips go through S3; the 250 MB unzipped limit still applies) |
| Layers per function | 5 |
| Container images (the escape hatch) | 10 GB |

Layers are extracted into `/opt`, and the Python runtime puts
`/opt/python` on `sys.path`. So the whole game is: what ends up in
`/opt/python`, and does it still work?

---

## 2. The idea: most of a `pip install` never executes

`pip install` serves *developers*. It ships C headers, test suites,
documentation, and debug symbols inside shared libraries. A Lambda only needs
**what runs**. So the job isn't "compress harder". It's:

```text
install everything ─► remove what never executes ─► PROVE what's left still works
                                                     (inside the real Lambda image)
```

The third step is where engineering separates from guesswork. Deleting files
from a dependency tree is easy. Knowing you didn't break it is the job.

---

## 3. The pipeline: a three-stage Docker build

```text
┌─ Stage 1: builder (public.ecr.aws/sam/build-python3.11) ──────────────────────┐
│  RUN --mount=type=ssh pip install --only-binary=:all: --target /opt/python …  │
│  prune_layer.sh /opt/python        ("dependency surgery", section 6)          │
└───────────────────────────────────────────────────────────────────────────────┘
                     │ COPY /opt/python
                     ▼
┌─ Stage 2: runtime-verifier (public.ecr.aws/lambda/python:3.11) ───────────────┐
│  verify_layer.py  → total bytes ≤ 262,144,000, else exit 1; top-10 size table │
│  test_smoke.py    → import cv2/PIL/numpy/onnxruntime, run a real GaussianBlur, │
│                     initialise ONNX Runtime                                    │
└───────────────────────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─ Stage 3: exporter (FROM scratch) → only /opt/python → make extract → layer.zip ┐
```

GitHub Actions builds the verifier stage on every push and pull request, so
**size and behaviour are checked before anything can be published.**

---

## 4. Build on a Lambda-compatible image, not `python:3.11-slim`

This one is easy to get wrong, and it fails at runtime, not at build time.

The Lambda Python 3.11 runtime runs on **Amazon Linux 2 (glibc 2.26)**. The
`python:3.11-slim` image is **Debian (glibc 2.36)**. pip picks wheels that
are compatible with the machine it runs on, so on Debian it can choose a
wheel built for a newer glibc. It installs fine, then fails on Lambda with
`GLIBC_2.28 not found`.

Build on `public.ecr.aws/sam/build-python3.11`, which matches the runtime,
and verify on `public.ecr.aws/lambda/python:3.11`, which is the runtime. If
it imports on your laptop, that proves nothing about Lambda.

---

## 5. Private dependencies without leaking credentials

The common anti-pattern:

```dockerfile
# ❌ the key ends up in the image history
ARG SSH_PRIVATE_KEY
RUN echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa && pip install -r requirements.txt && rm ~/.ssh/id_rsa
```

Removing the file in the same `RUN` does keep it out of the layer's
filesystem. **The leak is the build argument.** Values passed with `ARG`
and used in a `RUN` are recorded in the image's metadata and build cache, so
`docker history --no-trunc` shows them. Split the write and the delete
across two `RUN`s, and the key is also sitting in a layer.

BuildKit's SSH mount forwards your **host's ssh-agent socket** into a single
`RUN` step:

```dockerfile
# syntax=docker/dockerfile:1.4
RUN --mount=type=ssh \
    pip install --no-cache-dir --target /opt/python --only-binary=:all: -r requirements.txt
```

```bash
docker build --ssh default .
```

Git and pip authenticate through the agent. The private key stays in the
agent on the host: it's never written to the container's filesystem, a
layer, or the image history. In CI, load a **read-only deploy key** into an
agent first (for example with `webfactory/ssh-agent`), then build with
`--ssh default`.

---

## 6. Dependency surgery, and what it really removed

Everything here is in
[`scripts/prune_layer.sh`](https://github.com/Shivanshu27/lambda-layer-squeeze/blob/main/scripts/prune_layer.sh):

| Step | Removes | Why it's safe |
|---|---|---|
| 1 | `boto3`, `botocore`, `s3transfer` | the Lambda Python runtime already provides them |
| 2 | dev and docs tooling: pytest, `_pytest`, sphinx, docutils, pygments, snowballstemmer, pre-commit, sympy… | never imported by the inference path (see section 7 for how I found these) |
| 3 | `__pycache__`, `*.pyc` | regenerated as needed |
| 4 | `tests/`, `docs/`, `examples/` directories | not imported at runtime, **checked by the smoke test** |
| 5 | `*.c`, `*.h`, `*.pyx`, `*.md`, `*.txt` (keeping LICENSE/COPYING) | source and docs, not executed |
| 6 | `.dist-info/RECORD` and `INSTALLER` (keeping `METADATA`) | some packages read their own metadata at import time, so `METADATA` stays |
| 7 | `strip --strip-unneeded` on every ELF `.so` (67 files) | removes symbols that dynamic linking doesn't need; the dynamic symbol table stays |

Two warnings that apply to any pruning script, including mine:

- **Deleting by pattern can remove something a package needs.** Some
  packages ship data as `.txt`, or import their own `testing` module.
  Deleting all of `.dist-info`, or `setuptools`, can break packages that
  look up metadata or still use `pkg_resources`. **The smoke test is what
  makes pruning safe**, so it has to do real work, not just `import`.
- **Stripped libraries give worse native crash traces.** It's a deliberate
  trade: debug with an unstripped build.

---

## 7. What the CI history taught me

This is the part a "before and after" table hides. In order:

**1. Pillow started compiling from source.** The first version installed
PyTorch CPU wheels from PyTorch's own package index. pip quietly fell back
to building Pillow from source. Fix: isolate that index and pass
`--only-binary=:all:`, so a missing wheel **fails fast** instead of silently
compiling.

**2. With PyTorch in the stack, the install started at 1.1 GB.** No pruning
script closes that gap. The PyTorch wheel carries a whole *training*
engine: autograd, the compiler stack, and more. The real fix was
architectural. Train in PyTorch, export the model to **ONNX**, and ship
**ONNX Runtime** (about 17 MB in the final layer) for inference. Keep the
model weights in S3 or EFS, not in the layer.

**3. The CI gate fired: 252.82 MB, 2.82 MB over.** With ONNX Runtime the
install was 494 MB, and the first surgery brought it to 252.82 MiB. CI
failed the build, exactly as designed. The verifier's top-10 table pointed
at **sympy** and its dependency mpmath.

Here's the surprise: sympy isn't a stray dev tool. It's a **declared
dependency of onnxruntime itself**. Inference with `InferenceSession` never
imports it, so it's dead weight at runtime. I removed it, together with
pygments and docutils, which Sphinx had pulled in. Result: 228.46 MiB, and
the build passed.

The lesson: *the size check must be a CI gate.* Without it, a 2.8 MB
overrun ships and fails at deploy time instead.

**4. The Lambda base image's entrypoint hijacked my smoke tests.** That
image starts the Lambda runtime interface by default, so
`docker run image python3 script.py` wasn't doing what it looked like. Fix:
`ENTRYPOINT []` in the verifier stage, plus `--entrypoint python3` in CI and
the Makefile.

**5. `PYTHONPATH` had to include `/opt/python` in the verifier.** On real
Lambda the runtime adds it. In a plain `docker run` you have to, or the
smoke test passes or fails for the wrong reason.

**6. The size table exposed two more leaks.** Even after story 3, the
top-10 list still showed `_pytest` (1.28 MB) and `snowballstemmer`. The
prune pattern `pytest*` doesn't match pytest's private package `_pytest`,
and snowballstemmer exists only for Sphinx. I added both: 231.6 → 229.6 MiB.
*Read the biggest-items table on every build; glob patterns miss
underscore-prefixed packages.*

---

## 8. Where it stands

The verifier's real output from CI, in the Lambda Python 3.11 image:

```text
Package / Item                      | Size
------------------------------------------------------------
cv2                                 | 71.88 MB
opencv_python_headless.libs         | 60.30 MB
numpy.libs                          | 34.90 MB
numpy                               | 20.81 MB
onnxruntime                         | 17.18 MB
pillow.libs                         | 15.43 MB
PIL                                 | 1.99 MB
google                              | 1.24 MB
charset_normalizer                  | 643.72 KB
yaml                                | 572.78 KB
------------------------------------------------------------
Total Layer Size: 229.63 MB / 250.00 MB
AWS Lambda Quota Utilization: 91.9%
  [PASS] Successfully imported cv2 (v4.9.0)
  [PASS] Successfully imported PIL (v12.2.0)
  [PASS] Successfully imported numpy (v1.26.4)
  [PASS] Successfully imported onnxruntime (v1.16.3)
  [PASS] OpenCV image matrix Gaussian blur test succeeded (shape: (100, 100, 3))
  [PASS] ONNX Runtime execution engine initialized
```

| | Size |
|---|---:|
| After `pip install` | 494 MB |
| After surgery | **230 MB** (229.63 MiB, 91.9% of quota) |
| Reduction | ~53% |

**What's left, honestly:**
- **Two more leftovers.** `charset_normalizer` (pulled in through Sphinx's
  dependency on `requests`) and `yaml` (from pre-commit) still survive.
  They're the next items for the surgery list.
- **The biggest win is upstream.** Fix the dependency tree so dev tooling is
  never installed into a runtime layer in the first place. The demo
  installs it on purpose, to have something to remove.
- **The smoke test should run real inference.** It initialises ONNX Runtime
  but doesn't run a model yet; the next step is a tiny `.onnx` model and one
  real call.
- **91.9% of quota is warning territory.** A real team should alert at 90%,
  not wait for the hard failure.
- **The build isn't fully reproducible yet.** The SAM image tag and the
  Pillow pin should both be exact versions.

---

## 9. Checklist

1. **Know the real limit.** 262,144,000 bytes unzipped, covering code
   **and** all layers.
2. **Build on a Lambda-compatible image,** and verify inside the real
   runtime image. glibc mismatches fail at runtime, not at build time.
3. **Never pass secrets with `ARG`.** Use `--mount=type=ssh` (or
   `type=secret`) with read-only deploy keys.
4. **Use `--only-binary=:all:`,** so missing wheels fail fast instead of
   compiling silently.
5. **Ship an inference runtime, not a training framework.** ONNX Runtime or
   TorchScript, with weights in S3 or EFS.
6. **Prune, then prove.** A smoke test that does real work, in the real
   image.
7. **Gate size in CI and read the top-10 table.** That's how every leak in
   this post was found.

The full pipeline, scripts and CI are at
**[github.com/Shivanshu27/lambda-layer-squeeze](https://github.com/Shivanshu27/lambda-layer-squeeze)**.
