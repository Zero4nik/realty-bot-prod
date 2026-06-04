import './ExitModal.css';

interface ExitModalProps {
  onStay: () => void;
  onLeave: () => void;
}

export default function ExitModal({ onStay, onLeave }: ExitModalProps) {
  return (
    <div className="exit-modal-overlay" onClick={onStay}>
      <div className="exit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="exit-modal__header">
          <span className="exit-modal__icon">👋</span>
        </div>

        <div className="exit-modal__body">
          <p>Вы уверены, что хотите покинуть приложение?</p>
        </div>

        <div className="exit-modal__footer">
          <button className="exit-btn exit-btn--leave" onClick={onLeave}>
            Выйти
          </button>
          <button className="exit-btn exit-btn--stay" onClick={onStay}>
            Остаться
          </button>
        </div>
      </div>
    </div>
  );
}
