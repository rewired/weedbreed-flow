export interface StructureCard {
  id: string;
  name: string;
  budgetUtilization: {
    grid: number;
    water: number;
    area: number;
  };
}

export interface CompanyView {
  id: string;
  name: string;
  funds: number;
  structures: StructureCard[];
}

const mockCompany: CompanyView = {
  id: "company-1",
  name: "WeedBreed Co.",
  funds: 100000,
  structures: [
    {
      id: "structure-1",
      name: "Site A",
      budgetUtilization: { grid: 0.45, water: 0.3, area: 0.5 }
    }
  ]
};

export const getCompanyView = async () => mockCompany;