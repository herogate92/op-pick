export function ScoreMeter({ value, label }: { value: number; label?: string }) {
  return <span className="score-meter" aria-label={`${label ?? "점수"} ${value}점`}><span>{Array.from({ length: 5 }, (_, index) => <i key={index} className={index < value ? "filled" : ""} />)}</span>{label && <small>{label}</small>}</span>;
}
