interface Question {
  id: string;
  name: string;
  type: string;
  value: string;
}

interface Calculation {
  id: string;
  name: string;
  type: string;
  value: string;
}

interface UrlParameter {
  id: string;
  name: string;
  value: string;
}

interface Quiz {
  score: number;
  maxScore: number;
}

export interface ResponseData {
  responses: {
    questions: Question[];
    calculations: Calculation[];
    urlParameters: UrlParameter[];
    quiz?: Quiz;
    submissionId: string;
    submissionTime: string;
  }[];
  totalResponses: number;
  pageCount: number;
}

export type FilterClauseType = {
  id: string;
  condition: "equals" | "does_not_equal" | "greater_than" | "less_than";
  value: number | string;
};
