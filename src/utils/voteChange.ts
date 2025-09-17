import { Vote, VoteKind } from "@meshsdk/core";
import { CCMember } from "../types/types";

export async function getPreviousVoteChange({
  networkId,
  govActionID,
  selectedCCMember,
  newVote
}: {
  networkId: number;
  govActionID: string;
  selectedCCMember: CCMember | null;
  newVote: VoteKind | null;
}): Promise<{ isVoteChange: boolean; prevState: VoteKind | null; newState: VoteKind | null }> {
  let prevVote = null;
  
  console.log('Selected CC Member:', selectedCCMember?.hotCredential);
  console.log('Fetching previous vote for proposal ID:', govActionID);
  console.log('New Vote:', newVote);
  if (selectedCCMember) {
    const ccMemberHotCred = selectedCCMember.hotCredential;
    try {
      const res = await fetch(`/api/proxy?network=${networkId}&action=councilVotes&proposalId=${govActionID}&council=${ccMemberHotCred}`);
      console.log('Fetch response:', res);
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