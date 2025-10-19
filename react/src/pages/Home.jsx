import React from 'react';

function Home() {
  return (
    <section className="home" aria-labelledby="home-title" data-easytag="id001-react/src/pages/Home.jsx">
      <div className="container" data-easytag="id002-react/src/pages/Home.jsx">
        <h1 id="home-title" data-easytag="id003-react/src/pages/Home.jsx">Калькулятор</h1>
        <p className="subtitle" data-easytag="id004-react/src/pages/Home.jsx">Скоро здесь появится удобный калькулятор.</p>

        <div className="card" role="region" aria-label="Область калькулятора" data-easytag="id005-react/src/pages/Home.jsx">
          <div className="placeholder" data-easytag="id006-react/src/pages/Home.jsx">
            <span aria-hidden="true" data-easytag="id007-react/src/pages/Home.jsx">⌘</span>
            <span className="placeholder-text" data-easytag="id008-react/src/pages/Home.jsx">Заглушка</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
