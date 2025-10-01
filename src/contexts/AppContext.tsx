import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Entity {
  id: string;
  name: string;
  logo?: string;
  createdAt: Date;
}

export interface Report {
  id: string;
  entityId: string;
  name: string;
  url: string;
  startDate: Date;
  status: 'draft' | 'in-progress' | 'completed';
  score?: number;
  pages: AuditPage[];
}

export interface AuditPage {
  id: string;
  name: string;
  criteria: CriteriaResult[];
}

export interface CriteriaResult {
  id: string;
  code: string;
  title: string;
  level: 'A' | 'AA' | 'AAA';
  status: 'compliant' | 'non-compliant' | 'not-applicable';
  observation: string;
}

interface AppContextType {
  entities: Entity[];
  reports: Report[];
  addEntity: (entity: Omit<Entity, 'id' | 'createdAt'>) => void;
  addReport: (report: Omit<Report, 'id' | 'status' | 'pages'>) => string;
  updateReport: (id: string, updates: Partial<Report>) => void;
  getReportsByEntity: (entityId: string) => Report[];
  getEntityById: (id: string) => Entity | undefined;
  getReportById: (id: string) => Report | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  const addEntity = (entity: Omit<Entity, 'id' | 'createdAt'>) => {
    const newEntity: Entity = {
      ...entity,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setEntities(prev => [...prev, newEntity]);
  };

  const addReport = (report: Omit<Report, 'id' | 'status' | 'pages'>) => {
    const newReport: Report = {
      ...report,
      id: Math.random().toString(36).substr(2, 9),
      status: 'draft',
      pages: [],
    };
    setReports(prev => [...prev, newReport]);
    return newReport.id;
  };

  const updateReport = (id: string, updates: Partial<Report>) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const getReportsByEntity = (entityId: string) => {
    return reports.filter(r => r.entityId === entityId);
  };

  const getEntityById = (id: string) => {
    return entities.find(e => e.id === id);
  };

  const getReportById = (id: string) => {
    return reports.find(r => r.id === id);
  };

  return (
    <AppContext.Provider value={{
      entities,
      reports,
      addEntity,
      addReport,
      updateReport,
      getReportsByEntity,
      getEntityById,
      getReportById,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
