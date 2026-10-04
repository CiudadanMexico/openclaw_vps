#!/usr/bin/env python3
"""Programa publicaciones a grupos de Facebook con intervalos aleatorios.
Uso: scheduler.py [--posts N] [--min X] [--max Y] [--message TEXTO]
                  [--start-delay MIN] [--dry-run]
Lee config.json (en el mismo directorio) para opciones por defecto y group_ids.
Resultados a run_AAAAMMDD.log
"""
import json, os, random, subprocess, sys, time, argparse

HERE = os.path.dirname(os.path.abspath(__file__))

def load(cfgpath):
    with open(cfgpath, encoding="utf-8") as f:
        return json.load(f)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default=os.path.join(HERE, "config.json"))
    ap.add_argument("--message", default=None)
    ap.add_argument("--posts", type=int, default=None)
    ap.add_argument("--min", type=float, default=None, help="min intervalo en minutos")
    ap.add_argument("--max", type=float, default=None, help="max intervalo en minutos")
    ap.add_argument("--start-delay", type=float, default=0.0, help="min antes del primer post")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    cfg = load(args.config)
    posts = args.posts or int(cfg.get("posts", 40))
    lo = args.min or float(cfg.get("interval_min_minutes", 7))
    hi = args.max or float(cfg.get("interval_max_minutes", 8))
    msg = args.message if args.message is not None else cfg.get("message", "")
    groups = cfg.get("group_ids", [])
    if not isinstance(groups, list) or all(not str(g).strip() for g in groups):
        groups = []

    if lo > hi:
        lo, hi = hi, lo
    gaps = [random.uniform(lo, hi) * 60 for _ in range(posts)]
    dur_h = sum(gaps) / 3600.0

    print(f"DISTRIBUCION: {posts} posts | intervalo {lo}-{hi} min | duracion estimada {dur_h:.1f}h")
    for i, g in enumerate(gaps):
        print(f"  post {i+1:>3}: +{g/60:5.1f} min")
    if args.dry_run:
        return 0
    if not groups:
        print("ERROR: group_ids vacio en config.json — llena la lista de grupos primero.")
        return 2

    today = time.strftime("%Y-%m-%d")
    log = os.path.join(HERE, f"run_{today}.log")
    postscript = os.path.join(HERE, "post.sh")

    if args.start_delay:
        print(f"esperando {args.start_delay} min antes de empezar...")
        time.sleep(args.start_delay * 60)

    for i in range(posts):
        ts = time.strftime("%H:%M:%S")
        gid = str(groups[i % len(groups)]).strip()
        print(f"{ts} [{i+1}/{posts}] publicando en grupo {gid} ...")
        r = subprocess.run([postscript, gid, msg], capture_output=True, text=True)
        ok = "RESULT=OK" in (r.stdout or "")
        line = f"{time.strftime('%Y-%m-%d %H:%M:%S')} post={i+1} group={gid} ok={ok} resp={(r.stdout or r.stderr).strip()[-240:]}"
        print(("OK" if ok else "FAIL") + " | " + line)
        with open(log, "a", encoding="utf-8") as f:
            f.write(line + "\n")
        if i < posts - 1:
            wait = gaps[i]
            print(f"  siguiente en {wait/60:.1f} min")
            time.sleep(wait)
    print("FIN")

if __name__ == "__main__":
    main()