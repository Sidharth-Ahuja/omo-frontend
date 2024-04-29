import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeDeposit from './StripeDeposit';

const stripePromise = loadStripe('pk_test_51NtxHlLbm1lvDAWAzLikax8OfTrXFyBbgX5wcWd3ql70LwL56jR5xSMa2JeBaZwVThtas7L4zKRGf3oAyFKuZWnk00JpD0nTqX');

function StripeDepositParent() {
//   const [depositAmount, setDepositAmount] = useState(1000); // Default deposit amount is $10

  return (
    <div className="App">
      <Elements stripe={stripePromise}>
        <StripeDeposit />
      </Elements>
    </div>
  );
}

export default StripeDepositParent;
