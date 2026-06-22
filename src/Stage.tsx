import { ReactElement } from "react";
import { StageBase, InitialData, Message } from "@chub-ai/stages-ts";
import { LoadResponse } from "@chub-ai/stages-ts/dist/types/load";

type MessageStateType = {
  corruption: number;
  libido: number;
  purity: number;
  obedience: number;
  sensitivity: number;
};

type ConfigType = any;
type InitStateType = any;
type ChatStateType = any;

export class Stage extends StageBase<InitStateType, ChatStateType, MessageStateType, ConfigType> {
  private state: MessageStateType;

  constructor(data: InitialData<InitStateType, ChatStateType, MessageStateType, ConfigType>) {
    super(data);
    this.state = data.messageState ?? {
      corruption: 15,
      libido: 25,
      purity: 75,
      obedience: 20,
      sensitivity: 30,
    };
  }

  async load(): Promise<Partial<LoadResponse<InitStateType, ChatStateType, MessageStateType>>> {
    return { success: true, error: null, initState: null, chatState: null };
  }

  async setState(state: MessageStateType): Promise<void> {
    if (state != null) {
      this.state = { ...this.state, ...state };
    }
  }

  getCorruptionLevel(): string {
    const c = this.state.corruption;
    if (c < 20) return "Pure & Innocent";
    if (c < 40) return "Slightly Tempted";
    if (c < 60) return "Falling into Sin";
    if (c < 80) return "Deeply Corrupted";
    return "Completely Broken";
  }

  getColor(): string {
    const c = this.state.corruption;
    if (c < 30) return "#818cf8";
    if (c < 60) return "#c026d3";
    return "#e11d48";
  }

  incrementStat(stat: keyof MessageStateType, amount: number) {
    if (stat === "purity") {
      this.state.purity = Math.max(0, this.state.purity - amount);
      this.state.corruption = Math.min(100, this.state.corruption + Math.floor(amount * 0.7));
    } else {
      this.state[stat] = Math.min(100, (this.state[stat] || 0) + amount);
      if (stat !== "purity") {
        this.state.corruption = Math.min(100, this.state.corruption + Math.floor(amount * 0.5));
      }
    }
  }

  async beforePrompt(userMessage: Message): Promise<any> {
    return {
      messageState: this.state,
      systemMessage: `=== CURRENT CORRUPTION STATUS ===
Level: ${this.getCorruptionLevel()}
Corruption: ${this.state.corruption}%
Libido: ${this.state.libido}%
Purity: ${this.state.purity}%
Obedience: ${this.state.obedience}%
Sensitivity: ${this.state.sensitivity}%`,
    };
  }

  async afterResponse(botMessage: Message): Promise<any> {
    return { messageState: this.state };
  }

  render(): ReactElement {
    const c = this.state.corruption;
    const level = this.getCorruptionLevel();
    const color = this.getColor();

    return (
      <div style={{
        width: "100%", height: "100%", background: "#0a0718", color: "#e0d4ff",
        fontFamily: "system-ui, sans-serif", padding: "20px", overflowY: "auto"
      }}>
        <h2 style={{ textAlign: "center", color: "#c026d3", marginBottom: "8px" }}>
          Corruption Stage
        </h2>

        <div style={{ fontSize: "1.5rem", textAlign: "center", fontWeight: "bold", marginBottom: "16px" }}>
          {level}
        </div>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span>Corruption</span>
            <span style={{ fontWeight: "bold" }}>{c}%</span>
          </div>
          <div style={{ height: "22px", background: "#1f1b2e", borderRadius: "9999px", overflow: "hidden" }}>
            <div style={{
              width: `${c}%`,
              height: "100%",
              background: `linear-gradient(to right, ${color}, #f472b6)`,
              transition: "width 0.5s ease"
            }} />
          </div>
        </div>

        <div style={{ display: "grid", gap: "16px" }}>
          {(["libido", "purity", "obedience", "sensitivity"] as const).map(stat => (
            <div key={stat}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ textTransform: "capitalize" }}>{stat}</span>
                <span>{this.state[stat]}%</span>
              </div>
              <div style={{ height: "10px", background: "#1f1b2e", borderRadius: "9999px", overflow: "hidden" }}>
                <div style={{
                  width: `${this.state[stat]}%`,
                  height: "100%",
                  background: stat === "purity" ? "#64748b" : "#a855f7",
                  transition: "width 0.5s ease"
                }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "32px" }}>
          <h3 style={{ color: "#c4b5fd", marginBottom: "12px" }}>Actions (click to corrupt)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button onClick={() => this.incrementStat("corruption", 10)} style={btnStyle}>Tease & Flirt</button>
            <button onClick={() => this.incrementStat("libido", 12)} style={btnStyle}>Intimate Touch</button>
            <button onClick={() => this.incrementStat("obedience", 10)} style={btnStyle}>Give Command</button>
            <button onClick={() => this.incrementStat("sensitivity", 8)} style={btnStyle}>Stimulate</button>
            <button onClick={() => this.incrementStat("purity", 15)} style={{...btnStyle, backgroundColor: "#334155"}}>Corrupt Further</button>
            <button onClick={() => this.incrementStat("corruption", 18)} style={btnStyle}>Push Her Limits</button>
          </div>
        </div>
      </div>
    );
  }
}

const btnStyle = {
  padding: "14px 10px",
  backgroundColor: "#4c1d95",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "0.95rem",
} as const;