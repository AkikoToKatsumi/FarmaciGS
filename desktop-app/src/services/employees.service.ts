// services/employees.service.ts
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4004/api' });

export interface Employee {
  user_id?: number;
  hire_date?: string;
  salary: number;
  status: string;
  email: string;
  name: string;
  position: string;
  department: string;
  contracttype: string;
  schedule: string;
  startdate?: string;
  phone: string;
  address: string;
}

export interface CreateEmployeeData {
  name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  contractType: string;
  schedule: string;
  phone: string;
  address: string;
  status?: string;
}

class EmployeeService {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getAllEmployees(): Promise<Employee[]> {
    try {
      const response = await API.get('/employees', { headers: this.getHeaders() });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      throw new Error(error.response?.data?.message || 'Error fetching employees');
    }
  }

  async getEmployeeById(id: number): Promise<Employee> {
    try {
      const response = await API.get(`/employees/${id}`, { headers: this.getHeaders() });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching employee:', error);
      throw new Error(error.response?.data?.message || 'Error fetching employee');
    }
  }

  async createEmployee(employeeData: CreateEmployeeData): Promise<Employee> {
    try {
      const response = await API.post('/employees', employeeData, { headers: this.getHeaders() });
      return response.data;
    } catch (error: any) {
      console.error('Error creating employee:', error);
      throw new Error(error.response?.data?.message || 'Error creating employee');
    }
  }

  async updateEmployee(id: number, employeeData: Partial<CreateEmployeeData>): Promise<Employee> {
    try {
      const response = await API.put(`/employees/${id}`, employeeData, { headers: this.getHeaders() });
      return response.data;
    } catch (error: any) {
      console.error('Error updating employee:', error);
      throw new Error(error.response?.data?.message || 'Error updating employee');
    }
  }

  async deleteEmployee(id: number): Promise<void> {
    try {
      await API.delete(`/employees/${id}`, { headers: this.getHeaders() });
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      throw new Error(error.response?.data?.message || 'Error deleting employee');
    }
  }

  async searchEmployees(searchTerm: string): Promise<Employee[]> {
    try {
      const response = await API.get('/employees/search', {
        headers: this.getHeaders(),
        params: { term: searchTerm },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error searching employees:', error);
      throw new Error(error.response?.data?.message || 'Error searching employees');
    }
  }

  async getEmployeesByDepartment(department: string): Promise<Employee[]> {
    try {
      const response = await API.get(`/employees/department/${encodeURIComponent(department)}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching employees by department:', error);
      throw new Error(error.response?.data?.message || 'Error fetching employees by department');
    }
  }

  async getEmployeesByStatus(status: string): Promise<Employee[]> {
    try {
      const response = await API.get(`/employees/status/${status}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching employees by status:', error);
      throw new Error(error.response?.data?.message || 'Error fetching employees by status');
    }
  }

  async getEmployeeStats(): Promise<any> {
    try {
      const response = await API.get('/employees/stats', { headers: this.getHeaders() });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching employee stats:', error);
      throw new Error(error.response?.data?.message || 'Error fetching employee stats');
    }
  }
}

export const employeeService = new EmployeeService();
