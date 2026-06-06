import { useNavigate } from 'react-router-dom';

export default function ProtertyBack() {
  const navigate = useNavigate();
  return (
    <div>
      <button className="property-back" onClick={() => navigate(-1)}>
        ← Назад к поиску
      </button>
    </div>
  );
}
