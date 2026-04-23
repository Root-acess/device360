import { useState } from 'react';
import { PhoneStep } from './contact/PhoneStep';
import { OTPStep } from './contact/OTPStep';
import { NameStep, AddressStep, TimeSlotStep } from './contact/ContactSteps';import type { StepProps, AddressFields } from '../../types';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const LeadCapture: React.FC<StepProps> = ({ formData, updateFormData, goToNextStep, goToPreviousStep }) => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState(formData.phone || '');
  const [name, setName] = useState(formData.name || '');
  const [address, setAddress] = useState<AddressFields>({ doorNumber: '', street: '', floor: '', landmark: '', city: '', pincode: '' });
  const [timeSlot, setTimeSlot] = useState(formData.timeSlot || '');
  const [submitting, setSubmitting] = useState(false);

  const back = () => (step > 1 ? setStep((s) => s - 1) : goToPreviousStep());

  const submitBooking = async (slot: string) => {
    setSubmitting(true);
    try {
      const addrStr = `${address.doorNumber}, ${address.floor ? address.floor + ', ' : ''}${address.street}, ${address.landmark ? address.landmark + ', ' : ''}${address.city} - ${address.pincode}`;
      const body = {
        name, phone, address: addrStr, addressDetails: address, timeSlot: slot,
        brand: formData.brand?.name, model: formData.model,
        issue: formData.issue?.name, price: formData.pricing?.price,
        estimatedTime: formData.pricing?.time, isLiveRepair: formData.issue?.liveRepair || false,
        doorstepPickup: true,
      };
      const res = await fetch(`${BACKEND}/api/leads`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      const data = await res.json();
      updateFormData({ phone, name, address, timeSlot: slot, bookingId: data.bookingId });
      goToNextStep();
    } catch (err: any) {
      alert(err.message || 'Failed to submit booking. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (submitting) return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 font-medium">Confirming your booking…</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Step {step} of 5</p>
      </div>
      {step === 1 && <PhoneStep phone={phone} onSubmit={(p) => { setPhone(p); setStep(2); }} goBack={goToPreviousStep} />}
      {step === 2 && <OTPStep phone={phone} onVerify={() => setStep(3)} goBack={back} />}
      {step === 3 && <NameStep name={name} onSubmit={(n) => { setName(n); setStep(4); }} goBack={back} />}
      {step === 4 && <AddressStep address={address} onSubmit={(a) => { setAddress(a); setStep(5); }} goBack={back} />}
      {step === 5 && <TimeSlotStep timeSlot={timeSlot} onSubmit={(s) => { setTimeSlot(s); submitBooking(s); }} goBack={back} />}
    </div>
  );
};
