import React from 'react';
import Calculator from '../components/Calculator';

function Home() {
  return (
    <section className="home-section" aria-label="Главная страница" data-easytag="id101-react/src/pages/Home.jsx">
      <div className="home-container" data-easytag="id102-react/src/pages/Home.jsx">
        <h1 className="visually-hidden" data-easytag="id103-react/src/pages/Home.jsx">Калькулятор</h1>
        <Calculator />
      </div>
    </section>
  );
}

export default Home;
