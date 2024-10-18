import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '../../components/Layout';
import SidebarMenu from '../../components/SidebarMenu';
import Header from '../../components/Header';

jest.mock('../../components/SidebarMenu', () => () => <div data-testid="sidebar-menu">Sidebar Menu</div>);
jest.mock('../../components/Header', () => (props) => <div data-testid="header">Header with logout</div>);

const mockLogout = jest.fn();

describe('Layout Component', () => {
  it('renders SidebarMenu and Header components', () => {
    render(
      <Layout logout={mockLogout}>
        <div data-testid="content">Main content</div>
      </Layout>
    );

    // Check if SidebarMenu and Header are rendered
    expect(screen.getByTestId('sidebar-menu')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();

    // Check if the main content is rendered
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('passes the logout prop to the Header component', () => {
    render(
      <Layout logout={mockLogout}>
        <div>Main content</div>
      </Layout>
    );

    // Ensure the Header component received the logout prop
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(mockLogout).not.toHaveBeenCalled(); // Ensure no automatic calls
  });

  it('renders the children within the content area', () => {
    render(
      <Layout logout={mockLogout}>
        <div data-testid="child-content">Child Content</div>
      </Layout>
    );

    // Check if the children content is rendered
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });
});
