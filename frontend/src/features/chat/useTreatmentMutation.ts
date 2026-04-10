import { useMutation } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { createSymptomPayload } from './backendMapping';

export function useTreatmentMutation() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (symptomDescription: string) => {
      if (!actor) {
        throw new Error('Backend actor not initialized');
      }

      const userPrincipal = identity?.getPrincipal();
      const symptom = createSymptomPayload(symptomDescription, userPrincipal);
      
      const response = await actor.getTreatment(symptom);
      return response;
    }
  });
}
