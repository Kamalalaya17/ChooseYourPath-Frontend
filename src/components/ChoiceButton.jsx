export default function ChoiceButton({ choice, onSelect, disabled, isNewPath }) {
  return (
    <button type="button" className="cyp-choice-btn" onClick={() => onSelect(choice)} disabled={disabled}>
      {choice.choiceText || choice.choice_text}
      <span className="cyp-choice-path">{choice.pathName || choice.path_name}</span>
      {isNewPath && <span className="cyp-choice-new">NEW PATH</span>}
    </button>
  );
}
