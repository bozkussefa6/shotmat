import { AvatarColors } from '../styles/GlobalStyles';

export const getInitials = (name) => {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const getAvatarColor = (name, color) => {
  if (color) return color;
  if (!name?.trim()) return AvatarColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AvatarColors[Math.abs(hash) % AvatarColors.length];
};

export const normalizePlayer = (player) => {
  if (!player) return player;
  const color = player.color || getAvatarColor(player.name);
  const { emoji, ...rest } = player;
  return { ...rest, color };
};
