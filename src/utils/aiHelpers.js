export function getClosestTarget(enemy, players) {
  let target = null;
  let minDistSq = Infinity;
  let dx = 0,
    dy = 0;

  for (const p of players) {
    if (!p.active) continue;
    const _dx = p.x - enemy.x;
    const _dy = p.y - enemy.y;
    const dSq = _dx * _dx + _dy * _dy;
    if (dSq < minDistSq) {
      minDistSq = dSq;
      target = p;
      dx = _dx;
      dy = _dy;
    }
  }
  return { target, dx, dy, distSq: minDistSq };
}

export function safePlay(sprite, key) {
  if (sprite.anims.currentAnim?.key !== key) sprite.play(key, true);
}
