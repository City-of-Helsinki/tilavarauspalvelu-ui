import { Application, EditorState } from '../common/types';

export const minimalApplicationForInitialSave = (
  applicationRoundId: number
): Application => ({
  status: 'draft',
  applicantType: null,
  applicationRoundId,
  organisation: null,
  applicationEvents: [],
  contactPerson: null,
  billingAddress: null,
});

const applicationInitializer = ({
  id,
  applicationRoundId,
}: Application): EditorState => {
  if (!id) {
    return {
      application: minimalApplicationForInitialSave(applicationRoundId),
      accordionStates: [],
    };
  }
  return {} as EditorState;
};

export default applicationInitializer;
