import { type Symptom } from '../../backend';
import { Principal } from '@dfinity/principal';

export function createSymptomPayload(description: string, userPrincipal?: Principal): Symptom {
  return {
    description,
    creator: userPrincipal || Principal.anonymous()
  };
}
