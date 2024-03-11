import FileManagerLayout from "./FileManagerLayout";
import useFileManager from './useFileManager';

import {
  Provider as FileManagerProvider,
} from './FileManagerContext';

import { ErrorBoundary } from 'flight-webapp-components';
import styles from './FileManager.module.css';
import CloudCmdSkeleton from './CloudCmdSkeleton';
import './cloudcmd-style-patches.css';

function AuthenticatedDashboard() {
  const contextData = useFileManager();

  return (
    <>
      <div
        className="centernav col-12 fullscreen"
      >
        <FileManagerProvider value={contextData}>
          <FileManagerLayout>
            <ErrorBoundary>
              <div className={`fullscreen-content ${styles.FileManagerWrapper}`} >
                <CloudCmdSkeleton />
              </div>
            </ErrorBoundary>
          </FileManagerLayout>
        </FileManagerProvider>
      </div>
    </>
  );
}

export default AuthenticatedDashboard;
