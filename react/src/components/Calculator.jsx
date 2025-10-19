import React, { useEffect, useMemo, useState } from 'react';
import './Calculator.css';

// Easyappz: iOS-like calculator component

const OPERATORS = {
  add: '+',
  sub: '−',
  mul: '×',
  div: '÷',
};

function getLocaleSeparators() {
  const nf = new Intl.NumberFormat();
  const sampleGroup = nf.format(1000); // e.g. "1,000" or "1 000"
  const sampleDec = nf.format(1.1);    // e.g. "1.1" or "1,1"
  const group = sampleGroup[1];
  const decimal = sampleDec[1];
  return { group, decimal };
}

function clampPrecision(n) {
  if (!isFinite(n)) return n;
  return Number(n.toPrecision(12));
}

function addGroupingToInt(intStr, groupSep) {
  const negative = intStr[0] === '-';
  const clean = negative ? intStr.slice(1) : intStr;
  let result = '';
  let counter = 0;
  for (let i = clean.length - 1; i >= 0; i--) {
    result = clean[i] + result;
    counter++;
    if (counter === 3 && i !== 0) {
      result = groupSep + result;
      counter = 0;
    }
  }
  return negative ? '-' + result : result;
}

function formatTypedString(str, groupSep, decSep) {
  // str uses '.' as decimal separator internally
  if (str === '' || str === '-') return '0';
  const negative = str[0] === '-';
  const s = negative ? str.slice(1) : str;
  const dotIndex = s.indexOf('.');
  const hasDot = dotIndex !== -1;
  const intPart = hasDot ? s.slice(0, dotIndex) : s;
  const fracPart = hasDot ? s.slice(dotIndex + 1) : '';
  const groupedInt = addGroupingToInt((negative ? '-' : '') + (intPart === '' ? '0' : intPart), groupSep);
  if (hasDot) {
    return groupedInt + decSep + fracPart;
  }
  return groupedInt;
}

function toExponentialString(n) {
  const exp = n.toExponential(9); // e.g. "1.234567890e+8"
  return exp;
}

function formatComputedNumber(n, groupSep, decSep) {
  if (n === 0) return '0';
  if (!isFinite(n)) return '∞';
  const abs = Math.abs(n);
  if (abs >= 1e12 || (abs !== 0 && abs < 1e-9)) {
    return toExponentialString(n);
  }
  const rounded = clampPrecision(n);
  if (!isFinite(rounded)) return '∞';
  let str = String(rounded);
  // Avoid scientific here if present after toPrecision effects
  if (str.indexOf('e') !== -1 || str.indexOf('E') !== -1) {
    return toExponentialString(rounded);
  }
  const negative = str[0] === '-';
  if (negative) str = str.slice(1);
  const dotIndex = str.indexOf('.');
  const hasDot = dotIndex !== -1;
  let intPart = hasDot ? str.slice(0, dotIndex) : str;
  let fracPart = hasDot ? str.slice(dotIndex + 1) : '';
  // trim trailing zeros in fractional part
  while (fracPart.length > 0 && fracPart[fracPart.length - 1] === '0') {
    fracPart = fracPart.slice(0, -1);
  }
  const groupedInt = addGroupingToInt((negative ? '-' : '') + (intPart === '' ? '0' : intPart), groupSep);
  if (fracPart.length > 0) {
    return groupedInt + decSep + fracPart;
  }
  return groupedInt;
}

function compute(a, b, operatorSymbol) {
  const A = Number(a);
  const B = Number(b);
  let r = 0;
  if (operatorSymbol === OPERATORS.add) r = A + B;
  if (operatorSymbol === OPERATORS.sub) r = A - B;
  if (operatorSymbol === OPERATORS.mul) r = A * B;
  if (operatorSymbol === OPERATORS.div) r = B === 0 ? Infinity : A / B;
  return clampPrecision(r);
}

function Calculator() {
  const { group: groupSep, decimal: decSep } = useMemo(getLocaleSeparators, []);

  const [currentInput, setCurrentInput] = useState('0'); // internal string with '.' decimal
  const [previousValue, setPreviousValue] = useState(null); // number
  const [operator, setOperator] = useState(null); // '+', '−', '×', '÷'
  const [isTyping, setIsTyping] = useState(false);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [lastOperation, setLastOperation] = useState({ operator: null, operand: null });

  const acLabel = currentInput !== '0' ? 'C' : 'AC';

  function getDisplay() {
    // If user is typing, show typed formatting; else show computed formatting
    if (isTyping || (operator === null && !justEvaluated)) {
      return formatTypedString(currentInput, groupSep, decSep);
    }
    const n = Number(currentInput);
    if (currentInput === 'Infinity' || !isFinite(n)) {
      return '∞';
    }
    return formatComputedNumber(n, groupSep, decSep);
  }

  function getFontSize(displayStr) {
    const plain = displayStr
      .split(groupSep).join('')
      .split(decSep).join('')
      .replace('-', '');
    const len = plain.length;
    if (len <= 7) return '56px';
    if (len <= 9) return '48px';
    if (len <= 12) return '40px';
    return '32px';
  }

  function handleClear() {
    if (currentInput !== '0') {
      setCurrentInput('0');
      setIsTyping(false);
      setJustEvaluated(false);
      return;
    }
    // AC
    setCurrentInput('0');
    setPreviousValue(null);
    setOperator(null);
    setIsTyping(false);
    setJustEvaluated(false);
    setLastOperation({ operator: null, operand: null });
  }

  function handleSign() {
    if (currentInput === '0' || currentInput === 'Infinity') return;
    if (currentInput[0] === '-') {
      setCurrentInput(currentInput.slice(1));
    } else {
      setCurrentInput('-' + currentInput);
    }
    setIsTyping(true);
  }

  function handlePercent() {
    if (operator && previousValue !== null) {
      // a op (a*b/100)
      const b = Number(currentInput);
      const a = Number(previousValue);
      const percentValue = clampPrecision((a * b) / 100);
      setCurrentInput(String(percentValue));
      setIsTyping(true);
      setJustEvaluated(false);
      return;
    }
    const x = Number(currentInput);
    const result = clampPrecision(x / 100);
    setCurrentInput(String(result));
    setIsTyping(false);
    setJustEvaluated(false);
  }

  function pushDigit(d) {
    if (currentInput === 'Infinity' || currentInput === '∞') {
      setCurrentInput(String(d));
      setIsTyping(true);
      setPreviousValue(null);
      setOperator(null);
      setJustEvaluated(false);
      setLastOperation({ operator: null, operand: null });
      return;
    }
    if (justEvaluated && operator === null) {
      // Start new entry
      setCurrentInput(String(d));
      setIsTyping(true);
      setJustEvaluated(false);
      setPreviousValue(null);
      setLastOperation({ operator: null, operand: null });
      return;
    }
    if (!isTyping) {
      // starting to type a new operand
      setCurrentInput(String(d));
      setIsTyping(true);
      return;
    }
    // limit digits (excluding sign and decimal)
    const plain = currentInput.replace('-', '').replace('.', '');
    if (plain.length >= 12) return;
    if (currentInput === '0') {
      setCurrentInput(String(d));
    } else if (currentInput === '-0') {
      setCurrentInput('-' + String(d));
    } else {
      setCurrentInput(currentInput + String(d));
    }
  }

  function pushDecimal() {
    if (currentInput === 'Infinity' || currentInput === '∞') {
      setCurrentInput('0.');
      setIsTyping(true);
      setPreviousValue(null);
      setOperator(null);
      setJustEvaluated(false);
      setLastOperation({ operator: null, operand: null });
      return;
    }
    if (justEvaluated && operator === null) {
      setCurrentInput('0.');
      setIsTyping(true);
      setJustEvaluated(false);
      setPreviousValue(null);
      setLastOperation({ operator: null, operand: null });
      return;
    }
    if (!isTyping) {
      setCurrentInput('0.');
      setIsTyping(true);
      return;
    }
    if (currentInput.indexOf('.') !== -1) return;
    setCurrentInput(currentInput + '.');
  }

  function chooseOperator(opSymbol) {
    if (currentInput === 'Infinity' || currentInput === '∞') return; // ignore until cleared
    const curr = Number(currentInput);
    if (operator && isTyping && previousValue !== null) {
      // compute intermediate immediately
      const r = compute(previousValue, curr, operator);
      setPreviousValue(r);
      setCurrentInput(String(r));
      setOperator(opSymbol);
      setIsTyping(false);
      setJustEvaluated(false);
      return;
    }
    if (previousValue === null) {
      setPreviousValue(curr);
    }
    setOperator(opSymbol);
    setIsTyping(false);
    setJustEvaluated(false);
  }

  function handleEquals() {
    if (currentInput === 'Infinity' || currentInput === '∞') return;
    const curr = Number(currentInput);
    if (operator && previousValue !== null) {
      const r = compute(previousValue, curr, operator);
      setCurrentInput(String(r));
      setPreviousValue(null);
      setOperator(null);
      setIsTyping(false);
      setJustEvaluated(true);
      setLastOperation({ operator, operand: curr });
      return;
    }
    // repeat last operation
    if (justEvaluated && lastOperation.operator) {
      const left = Number(currentInput);
      const r = compute(left, lastOperation.operand, lastOperation.operator);
      setCurrentInput(String(r));
      setIsTyping(false);
      setJustEvaluated(true);
      return;
    }
  }

  function handleBackspace() {
    if (!isTyping) return;
    if (currentInput === '0' || currentInput === '-0') return;
    if (currentInput.length <= 1 || (currentInput.length === 2 && currentInput[0] === '-')) {
      setCurrentInput('0');
      setIsTyping(false);
      return;
    }
    setCurrentInput(currentInput.slice(0, -1));
  }

  useEffect(() => {
    function onKeyDown(e) {
      const key = e.key;
      if (key >= '0' && key <= '9') {
        e.preventDefault();
        pushDigit(key);
        return;
      }
      if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }
      if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
        return;
      }
      if (key === '.' || key === ',') {
        e.preventDefault();
        pushDecimal();
        return;
      }
      if (key === '+') {
        e.preventDefault();
        chooseOperator(OPERATORS.add);
        return;
      }
      if (key === '-') {
        e.preventDefault();
        // Distinguish operator vs sign? Standard calculators map '-' to operator
        chooseOperator(OPERATORS.sub);
        return;
      }
      if (key === '*') {
        e.preventDefault();
        chooseOperator(OPERATORS.mul);
        return;
      }
      if (key === '/') {
        e.preventDefault();
        chooseOperator(OPERATORS.div);
        return;
      }
      if (key === '%') {
        e.preventDefault();
        handlePercent();
        return;
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentInput, isTyping, operator, previousValue, justEvaluated, lastOperation]);

  const display = getDisplay();
  const fontSize = getFontSize(display);

  const isOperatorActive = (sym) => operator === sym && !isTyping;

  return (
    <div className="calc-wrapper" aria-label="Калькулятор" data-easytag="id201-react/src/components/Calculator.jsx">
      <div className="calc" data-easytag="id202-react/src/components/Calculator.jsx">
        <div className="calc-display" aria-live="polite" aria-label="Экран калькулятора" style={{ fontSize }} data-easytag="id203-react/src/components/Calculator.jsx">
          {display}
        </div>
        <div className="calc-grid" role="group" aria-label="Клавиши калькулятора" data-easytag="id204-react/src/components/Calculator.jsx">
          <button type="button" className={`btn btn-func`} aria-label="очистить" onClick={handleClear} data-easytag="id205-react/src/components/Calculator.jsx">{acLabel}</button>
          <button type="button" className="btn btn-func" aria-label="поменять знак" onClick={handleSign} data-easytag="id206-react/src/components/Calculator.jsx">+/-</button>
          <button type="button" className="btn btn-func" aria-label="процент" onClick={handlePercent} data-easytag="id207-react/src/components/Calculator.jsx">%</button>
          <button type="button" className={`btn btn-op ${isOperatorActive(OPERATORS.div) ? 'active' : ''}`} aria-label="делить" onClick={() => chooseOperator(OPERATORS.div)} data-easytag="id208-react/src/components/Calculator.jsx">{OPERATORS.div}</button>

          <button type="button" className="btn btn-num" aria-label="семь" onClick={() => pushDigit('7')} data-easytag="id209-react/src/components/Calculator.jsx">7</button>
          <button type="button" className="btn btn-num" aria-label="восемь" onClick={() => pushDigit('8')} data-easytag="id210-react/src/components/Calculator.jsx">8</button>
          <button type="button" className="btn btn-num" aria-label="девять" onClick={() => pushDigit('9')} data-easytag="id211-react/src/components/Calculator.jsx">9</button>
          <button type="button" className={`btn btn-op ${isOperatorActive(OPERATORS.mul) ? 'active' : ''}`} aria-label="умножить" onClick={() => chooseOperator(OPERATORS.mul)} data-easytag="id212-react/src/components/Calculator.jsx">{OPERATORS.mul}</button>

          <button type="button" className="btn btn-num" aria-label="четыре" onClick={() => pushDigit('4')} data-easytag="id213-react/src/components/Calculator.jsx">4</button>
          <button type="button" className="btn btn-num" aria-label="пять" onClick={() => pushDigit('5')} data-easytag="id214-react/src/components/Calculator.jsx">5</button>
          <button type="button" className="btn btn-num" aria-label="шесть" onClick={() => pushDigit('6')} data-easytag="id215-react/src/components/Calculator.jsx">6</button>
          <button type="button" className={`btn btn-op ${isOperatorActive(OPERATORS.sub) ? 'active' : ''}`} aria-label="вычесть" onClick={() => chooseOperator(OPERATORS.sub)} data-easytag="id216-react/src/components/Calculator.jsx">{OPERATORS.sub}</button>

          <button type="button" className="btn btn-num" aria-label="один" onClick={() => pushDigit('1')} data-easytag="id217-react/src/components/Calculator.jsx">1</button>
          <button type="button" className="btn btn-num" aria-label="два" onClick={() => pushDigit('2')} data-easytag="id218-react/src/components/Calculator.jsx">2</button>
          <button type="button" className="btn btn-num" aria-label="три" onClick={() => pushDigit('3')} data-easytag="id219-react/src/components/Calculator.jsx">3</button>
          <button type="button" className={`btn btn-op ${isOperatorActive(OPERATORS.add) ? 'active' : ''}`} aria-label="прибавить" onClick={() => chooseOperator(OPERATORS.add)} data-easytag="id220-react/src/components/Calculator.jsx">{OPERATORS.add}</button>

          <button type="button" className="btn btn-num btn-zero" aria-label="ноль" onClick={() => pushDigit('0')} data-easytag="id221-react/src/components/Calculator.jsx">0</button>
          <button type="button" className="btn btn-num" aria-label="десятичная запятая" onClick={pushDecimal} data-easytag="id222-react/src/components/Calculator.jsx">{decSep}</button>
          <button type="button" className="btn btn-op equals" aria-label="равно" onClick={handleEquals} data-easytag="id223-react/src/components/Calculator.jsx">=</button>
        </div>
      </div>
    </div>
  );
}

export default Calculator;
