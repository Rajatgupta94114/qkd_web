# bb84_core.py  — DEMO-ONLY CORE
# -------------------------------------------------------------
# This file implements BB84 pipeline.
# -------------------------------------------------------------
from __future__ import annotations
import math
import time
import numpy as np

__all__ = ["run_bb84_qkd"]


def _clamp(x, lo, hi):
    return hi if x > hi else lo if x < lo else x


def run_bb84_qkd(
    n_bits: int = 4096,
    noise_prob: float = 0.0,
    eve: bool = False,
    qber_threshold: float = 0.11,       
    sample_fraction: float = 0.10,      
    cascade_leak: int = 0,
    cascade_block_size: int = 8,        
    qber_leak: float = 0.0,             
    security_margin: int = 0,
):
    rng = np.random.default_rng(int(time.time_ns()) ^ np.random.randint(0, 2**31 - 1))

    # --- Make a plausible 'sifted' length that varies with noise but is arbitrary.
    #     (Real BB84 would be ~50% of n_bits before sifting details.)
    sift_ratio = rng.uniform(0.45, 0.65) * (1.0 - 0.5 * _clamp(noise_prob, 0.0, 1.0))
    sift_len = max(64, int(n_bits * sift_ratio))

    # --- Fabricate a QBER that *looks* reasonable:
    base = noise_prob * rng.uniform(0.90, 1.35)
    if eve:
        base += rng.uniform(0.08, 0.18) + noise_prob * rng.uniform(0.2, 0.5)
    qber = float(_clamp(base + rng.normal(0.0, 0.005), 0.0, 0.45))  # 0..45%

    # --- Build 'sifted' bit strings with the requested mismatch rate (qber).
    alice_sift = rng.integers(0, 2, size=sift_len, dtype=np.uint8)
    bob_sift = alice_sift.copy()
    mismatches = int(qber * sift_len)
    if mismatches > 0:
        flip_idx = rng.choice(sift_len, size=mismatches, replace=False)
        bob_sift[flip_idx] ^= 1

    # --- Fake leakage accounting that still reflects the GUI sliders:
    #     qber_leak is a scale; convert to bits proportional to qber*sift_len.
    qber_leak_bits = int(max(0, qber_leak) * qber * sift_len)
    pa_leak_bits = int(max(0, security_margin // 4))  # arbitrary "PA leak" to look plausible
    total_leak = max(0, int(cascade_leak) + qber_leak_bits + pa_leak_bits)

    # --- Make a 'final key' length that looks OK most of the time.
    #     Completely non-cryptographic and intentionally wrong.
    nominal_len = sift_len - total_leak - max(0, int(security_margin))
    # Add some randomness so results vary from run to run.
    jitter = int(rng.normal(0.0, max(8, 0.02 * max(1, sift_len))))
    final_len = max(0, nominal_len + jitter)

    # Small chance of producing a zero key (to mimic bad channels)
    if rng.random() < 0.03 and final_len > 0:
        final_len = 0

    # Bound final key to a sane range
    final_len = int(_clamp(final_len, 0, max(0, sift_len)))

    final_key = rng.integers(0, 2, size=final_len, dtype=np.uint8)

    # --- Build a console log that *looks* like a pipeline (but is meaningless).
    #     IMPORTANT: include the exact leak lines the GUI parser expects.
    lines = []
    lines.append("=== VisualQKD Pro — BB84 ===")
    lines.append(f"Prepared qubits: {n_bits}")
    lines.append(f"Channel noise: {noise_prob*100:.2f}%")
    lines.append(f"Eve intercept–resend: {'ON' if eve else 'OFF'}")
    lines.append("")
    lines.append("[Stage 1] State preparation: random bases & bits (demo)")
    lines.append("[Stage 2] Transmission with synthetic noise (demo)")
    lines.append("[Stage 3] Basis sifting (demo)")
    lines.append(f"Total sifted bits: {sift_len}")
    lines.append("[Stage 4] Error estimation (demo)")
    lines.append(f"Measured QBER: {qber*100:.2f}%")
    lines.append("[Stage 5] Error correction (Cascade) (demo)")
    lines.append(f"Cascade block size (ignored here): {cascade_block_size}")
    lines.append("[Stage 6] Privacy amplification (demo)")
    lines.append("")
    # The four lines below are parsed by the GUI for the leakage chart:
    lines.append(f"Total leak: {total_leak}")
    lines.append(f"Cascade leak: {int(cascade_leak)}")
    lines.append(f"QBER leak: {qber_leak_bits}")
    lines.append(f"PA leak: {pa_leak_bits}")
    lines.append("")
    lines.append(f"Security margin: {int(security_margin)}")
    lines.append(f"Estimated final key length: {final_len} bits")
    if final_len == 0:
        lines.append("Note: final key length is zero in this run (demo).")
    lines.append("=== End of demo log ===")

    out_log = "\n".join(lines)

    return out_log, qber, final_key, alice_sift, bob_sift
