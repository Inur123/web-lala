// ─── Data Models ────────────────────────────────────────────────────────────────

export interface NavLink {
  readonly label: string;
  readonly href: string;
}

export interface EventInfo {
  readonly id: string;
  readonly icon: string;
  readonly label: string;
  readonly value: string;
}

export interface FlowStep {
  readonly id: string;
  readonly label: string;
}

export interface TicketPrice {
  readonly id: string;
  readonly label: string;
  readonly priceRange: string;
  readonly description: string;
}
