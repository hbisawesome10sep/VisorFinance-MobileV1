import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Shield, AlertTriangle, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RiskAssessmentProps {
  onComplete: (riskProfile: RiskProfile) => void;
  initialRiskTolerance?: string;
}

export interface RiskProfile {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentStrategy: 'conservative' | 'balanced' | 'growth' | 'aggressive';
  score: number;
  recommendations: string[];
}

const questions = [
  {
    id: 'age',
    question: 'What is your age group?',
    options: [
      { value: '18-25', label: '18-25 years', score: 4 },
      { value: '26-35', label: '26-35 years', score: 3 },
      { value: '36-50', label: '36-50 years', score: 2 },
      { value: '50+', label: '50+ years', score: 1 },
    ]
  },
  {
    id: 'income',
    question: 'What is your annual income?',
    options: [
      { value: 'below-5l', label: 'Below ₹5 Lakhs', score: 1 },
      { value: '5l-15l', label: '₹5-15 Lakhs', score: 2 },
      { value: '15l-50l', label: '₹15-50 Lakhs', score: 3 },
      { value: 'above-50l', label: 'Above ₹50 Lakhs', score: 4 },
    ]
  },
  {
    id: 'investment-experience',
    question: 'How would you describe your investment experience?',
    options: [
      { value: 'beginner', label: 'Beginner - I have minimal investment knowledge', score: 1 },
      { value: 'intermediate', label: 'Intermediate - I understand basic investment concepts', score: 2 },
      { value: 'experienced', label: 'Experienced - I actively manage my investments', score: 3 },
      { value: 'expert', label: 'Expert - I have extensive investment knowledge', score: 4 },
    ]
  },
  {
    id: 'investment-horizon',
    question: 'What is your investment time horizon?',
    options: [
      { value: 'short', label: 'Less than 3 years', score: 1 },
      { value: 'medium', label: '3-7 years', score: 2 },
      { value: 'long', label: '7-15 years', score: 3 },
      { value: 'very-long', label: 'More than 15 years', score: 4 },
    ]
  },
  {
    id: 'risk-comfort',
    question: 'How comfortable are you with investment risk?',
    options: [
      { value: 'very-low', label: 'I prefer guaranteed returns even if lower', score: 1 },
      { value: 'low', label: 'I can accept small fluctuations for better returns', score: 2 },
      { value: 'moderate', label: 'I can accept moderate volatility for good returns', score: 3 },
      { value: 'high', label: 'I am comfortable with high risk for high returns', score: 4 },
    ]
  },
  {
    id: 'portfolio-loss',
    question: 'How would you react to a 20% portfolio loss in a market downturn?',
    options: [
      { value: 'panic-sell', label: 'I would sell immediately to prevent further losses', score: 1 },
      { value: 'hold', label: 'I would hold and wait for recovery', score: 2 },
      { value: 'buy-more', label: 'I would invest more at lower prices', score: 3 },
      { value: 'strategic', label: 'I would rebalance strategically', score: 4 },
    ]
  }
];

export function RiskAssessment({ onComplete, initialRiskTolerance }: RiskAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateRiskProfile(newAnswers);
    }
  };

  const calculateRiskProfile = (allAnswers: Record<string, string>) => {
    let totalScore = 0;
    let maxScore = 0;

    questions.forEach(question => {
      const answerValue = allAnswers[question.id];
      const option = question.options.find(opt => opt.value === answerValue);
      if (option) {
        totalScore += option.score;
      }
      maxScore += 4; // Maximum score per question
    });

    const scorePercentage = (totalScore / maxScore) * 100;
    
    let riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    let investmentStrategy: 'conservative' | 'balanced' | 'growth' | 'aggressive';
    let recommendations: string[];

    if (scorePercentage <= 40) {
      riskTolerance = 'conservative';
      investmentStrategy = 'conservative';
      recommendations = [
        'Focus on Fixed Deposits and Government Bonds',
        'Consider debt mutual funds for steady returns',
        'Maintain 6-12 months emergency fund',
        'Start with small equity exposure (10-20%)'
      ];
    } else if (scorePercentage <= 70) {
      riskTolerance = 'moderate';
      investmentStrategy = 'balanced';
      recommendations = [
        'Balanced portfolio: 60% debt, 40% equity',
        'Invest in hybrid mutual funds',
        'Consider SIPs for equity exposure',
        'Diversify across asset classes'
      ];
    } else {
      riskTolerance = 'aggressive';
      investmentStrategy = 'growth';
      recommendations = [
        'Equity-heavy portfolio: 70-80% stocks',
        'Invest in growth mutual funds',
        'Consider direct stock investments',
        'Explore international markets'
      ];
    }

    const riskProfile: RiskProfile = {
      riskTolerance,
      investmentStrategy,
      score: Math.round(scorePercentage),
      recommendations
    };

    setShowResults(true);
    onComplete(riskProfile);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResults) {
    return null; // Results are handled by parent component
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="w-5 h-5" />
          <span>Investment Risk Assessment</span>
        </CardTitle>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <h3 className="text-lg font-medium">
            {questions[currentQuestion].question}
          </h3>
          
          <RadioGroup className="space-y-3">
            {questions[currentQuestion].options.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                onClick={() => handleAnswer(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {currentQuestion > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
            >
              Previous Question
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function RiskProfileDisplay({ profile }: { profile: RiskProfile }) {
  const getRiskIcon = () => {
    switch (profile.riskTolerance) {
      case 'conservative': return <Shield className="w-5 h-5 text-green-600" />;
      case 'moderate': return <Target className="w-5 h-5 text-yellow-600" />;
      case 'aggressive': return <TrendingUp className="w-5 h-5 text-red-600" />;
    }
  };

  const getRiskColor = () => {
    switch (profile.riskTolerance) {
      case 'conservative': return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'moderate': return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'aggressive': return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
    }
  };

  return (
    <Card className={`${getRiskColor()}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getRiskIcon()}
            <span>Your Risk Profile</span>
          </div>
          <Badge variant="secondary" className="capitalize">
            {profile.riskTolerance}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Risk Score</span>
              <span className="text-sm font-bold">{profile.score}/100</span>
            </div>
            <Progress value={profile.score} className="h-3" />
          </div>

          <div>
            <h4 className="font-medium mb-2">Recommended Strategy: {profile.investmentStrategy}</h4>
            <ul className="space-y-2">
              {profile.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}