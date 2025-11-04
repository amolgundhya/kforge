const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface Report {
  id: string
  reportNo: string
  sampleId: string
  status: string
  fileUrl?: string
  version: number
  checksum?: string
  createdAt: string
  releasedAt?: string
  sample: {
    code: string
    state: string
    heat?: {
      heatNo: string
      materialGrade: string
      supplier: {
        name: string
        code: string
      }
    }
    tests?: Test[]
  }
}

export interface Test {
  id: string
  category: string
  method: string
  standard?: string
  status: string
  results: TestResult[]
}

export interface TestResult {
  id: string
  parameter: string
  value: number
  unit: string
  verdict: string
}

export interface Sample {
  id: string
  code: string
  state: string
  heat?: {
    heatNo: string
    materialGrade: string
    supplier: {
      name: string
      code: string
    }
  }
  tests?: Test[]
}

export interface CreateReportDto {
  sampleId: string
  reportNo?: string
  notes?: string
}

export interface UpdateReportDto {
  reportNo?: string
  notes?: string
  status?: string
  fileUrl?: string
}

export interface ReportQueryParams {
  reportNo?: string
  sampleId?: string
  status?: string
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const reportsApi = {
  async getReports(params?: ReportQueryParams) {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)])
    ).toString() : '';
    
    const response = await fetch(`${API_BASE_URL}/reports${queryString}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reports: ${response.status}`);
    }
    
    return response.json();
  },

  async getReport(id: string) {
    const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch report: ${response.status}`);
    }
    
    return response.json();
  },

  async createReport(data: CreateReportDto) {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create report: ${response.status}`);
    }
    
    return response.json();
  },

  async updateReport(id: string, data: UpdateReportDto) {
    const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update report: ${response.status}`);
    }
    
    return response.json();
  },

  async deleteReport(id: string) {
    const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete report: ${response.status}`);
    }
    
    return response.json();
  },

  async generateMTC(id: string) {
    const response = await fetch(`${API_BASE_URL}/reports/${id}/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate MTC: ${response.status}`);
    }
    
    return response.json();
  },

  async releaseReport(id: string) {
    const response = await fetch(`${API_BASE_URL}/reports/${id}/release`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to release report: ${response.status}`);
    }
    
    return response.json();
  },

  async downloadReport(id: string) {
    const response = await fetch(`${API_BASE_URL}/reports/${id}/download`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download report: ${response.status}`);
    }
    
    return response.blob();
  },

  async getSamplesByState(state: string = 'COMPLETED') {
    const response = await fetch(`${API_BASE_URL}/samples?state=${state}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch samples: ${response.status}`);
    }
    
    return response.json();
  }
};