import { useMutation } from "@tanstack/react-query";
import { kyClient } from "./fetchWithAuth";

type PendingTextReview = {
  reason?: string;
  status: string;
  text_id: string;
};
async function postDecisionText(body: PendingTextReview) {
  return await kyClient
    .post(`texts/${body.text_id}/review`, {
      json: { reason: body.reason, status: body.status },
    })
    .json();
}

export const useDecisionText = () => {
  return useMutation({
    mutationFn: postDecisionText,
  });
};
