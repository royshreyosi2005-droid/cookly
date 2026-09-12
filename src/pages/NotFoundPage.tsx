import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/common/EmptyState';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="py-12">
        <EmptyState
          type="general"
          title="Recipe Not Found"
          description="Looks like this page simmered away or doesn't exist anymore. Let’s get you back to delicious recipes."
          actionText="Back to Pantry Home"
          onAction={() => navigate('/')}
        />
      </div>
    </PageContainer>
  );
};
