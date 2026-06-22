export type TicketAttachment = {
  id: number;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  uploaded_by: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  created_at: string;
};

type UploadAttachmentResponse = {
  message: string;
  attachment: TicketAttachment;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function uploadTicketAttachment(
  token: string,
  ticketId: number,
  file: File,
): Promise<UploadAttachmentResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/attachments`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload attachment.');
  }

  return data as UploadAttachmentResponse;
}