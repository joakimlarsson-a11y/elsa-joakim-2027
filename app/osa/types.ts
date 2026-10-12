export type InvitationGuest = {
  id: string;
  name: string;
  attending: boolean | null;
  dietary_info: string | null;
  needs_bus: boolean;
  message: string | null;
};

export type Invitation = {
  group_name: string;
  status: "pending" | "sent" | "responded";
  has_email: boolean;
  personal_note?: string | null;
  guests: InvitationGuest[];
};

export type GuestResponse = {
  id: string;
  attending: boolean;
  dietary_info: string;
  needs_bus: boolean;
  message: string;
};
