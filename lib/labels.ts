import type { Role } from "./data";

// Kept apart from ./data so client components can use labels without bundling every JSON file.
export const roleLabels: Record<Role, string> = { tank: "돌격", damage: "공격", support: "지원" };
export const subroleLabels: Record<string, string> = {
  stalwart: "강건한 자", initiator: "개시자", bruiser: "투사", sharpshooter: "명사수", recon: "수색가",
  specialist: "전문가", flanker: "측면 공격가", survivor: "생존왕", medic: "의무관", tactician: "전술가",
};
export const roleAccent: Record<Role, string> = { tank: "#5fd4ff", damage: "#ff7153", support: "#5af0bd" };
