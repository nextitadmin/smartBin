export class CreatePickupDto {
  readonly date: Date;
  readonly address: string;
  readonly representative?: string;
  readonly customerName?: string;
  readonly branch?: string;
  readonly nextPickupDate?: Date;
  readonly agentNote?: string;
}
export class CreatePickupResponseDto {
  readonly date: Date;
  readonly address: string;
  readonly representative?: string;
  readonly customerName?: string;
  readonly branch?: string;
  readonly nextPickupDate?: Date;
  readonly agentNote?: string;
  readonly status: string; // Assuming status is a string, adjust if it's an enum
}