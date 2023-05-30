import React from 'react';
import { PropsWithChildren } from "react";
import Navigation from '../components/Navigation';

const NavigationSection = (props: PropsWithChildren): JSX.Element => {
  return (
    <div className="navigation-section">
      <Navigation />
    </div>
  );
};

export default NavigationSection;