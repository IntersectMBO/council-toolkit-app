import { Vote, VoteKind } from "@meshsdk/core";

export async function getPreviousVoteChange({
  networkId,
  govActionID,
  selectedCCMember,
  newVote
}: {
  networkId: number;
  govActionID: string;
  selectedCCMember: any;
  newVote: VoteKind | null;
}): Promise<{ isVoteChange: boolean; prevState: VoteKind | null; newState: VoteKind | null }> {
  let prevVote = null;
  if (selectedCCMember) {
    try {
      const res = await fetch(`/api/proxy?network=${networkId}&action=councilVotes&proposalId=${govActionID}&council=${encodeURIComponent(JSON.stringify(selectedCCMember))}`);
      if (res.ok) {
        const prevVoteData = await res.json();
        prevVote = prevVoteData?.vote || null;
      }
    } catch (e) {
      prevVote = null;
    }
  }
  const isVoteChange = prevVote !== null && prevVote !== newVote;
  return {
    isVoteChange,
    prevState: prevVote,
    newState: newVote
  };
}