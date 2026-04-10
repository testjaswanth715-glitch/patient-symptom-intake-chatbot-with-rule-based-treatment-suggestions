import Text "mo:core/Text";
import Principal "mo:core/Principal";

actor {
  type Symptom = {
    description : Text;
    creator : Principal;
  };

  public shared ({ caller }) func getTreatment(symptom : Symptom) : async Text {
    func contains(text : Text, substr : Text) : Bool {
      text.contains(#text substr);
    };

    let guidance : Text = if (contains(symptom.description, "chest pain")) {
      "If you are experiencing chest pain, especially if it is severe, associated with shortness of breath, sweating, nausea, or pain radiating to your arm or jaw, seek emergency care immediately. Do not wait to seek medical attention. Chest pain can indicate life-threatening conditions such as a heart attack or pulmonary embolism.
      ";
    } else if (contains(symptom.description, "headache")) {
      "Most headaches are benign and can be treated with rest and over-the-counter pain medication. However, seek emergency care immediately if you experience severe headache, confusion, weakness, vision changes, high fever, sudden onset (\"worst ever\"), neck stiffness, or any fainting.
      ";
    } else if (contains(symptom.description, "fever")) {
      "Monitor temperature closely. Most fevers resolve in 3-5 days. Seek emergency care if you have persistent fever above 104°F (40°C), confusion, shortness of breath, fainting, persistent vomiting, signs of dehydration, are immunocompromised, pregnant, or have a chronic illness.
      ";
    } else {
      "Your symptoms are not flagged as life-threatening, but if you experience worsening or severe symptoms, please seek medical care immediately. For any persistent or concerning health issues, consult your healthcare provider. This guidance is not a substitute for professional evaluation.";
    };

    guidance # " Medical Disclaimer: This is not medical advice. For emergency symptoms, seek immediate medical care. Always consult your healthcare provider for any health concerns.";
  };
};
