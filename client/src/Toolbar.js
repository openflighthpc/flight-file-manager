import classNames from 'classnames';
import { Button, ButtonGroup, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { useContext, useState } from 'react';

import {
  FullscreenButton,
  useData,
} from 'flight-webapp-components';

import { Context as FileManagerContext } from './FileManagerContext';
import styles from './FileManager.module.css';

function Toolbar({ onZenChange }) {
  const otherButtons = (
    <div className="flex-grow-1 d-flex justify-content-end">
      <FullscreenButton onZenChange={onZenChange} />
      <AppLinkButtons />
    </div>
  );
  return (
    <div className="btn-toolbar flex-grow-1">
      <ActionButtons />
      {otherButtons}
    </div>
  );
}


function ActionButtons() {
  const actions = (
    <>
    <NavButtons />
    <NewFileFolderButtons />
    <OperationsButtons />
    <CopyPasteButtons />
    <UpDownloadButtons />
    <TarballButtons />
    <SelectionButtons />
    <BookmarkButtons />
    </>
  );

  return actions;
};

function BookmarkButtons() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);

  const data = useData()
  const bookmarks = data("bookmarks")

  return (
    <Dropdown
      className="btn-group mr-2"
      isOpen={dropdownOpen}
      toggle={toggleDropdown}
    >
      <DropdownToggle split color="light" size="sm" caret>
        <i className="fa fa-bookmark mr-2" />
      </DropdownToggle>
      <DropdownMenu>
        {/* DROPDOWN ITEMS GO HERE */}
      </DropdownMenu>
    </Dropdown>
  );
}

function NavButtons() {
  const { goToParentDir, isRootDir } = useContext(FileManagerContext);
  return (
    <ButtonGroup className={classNames("mr-2", styles.ButtonGroup)}>
      <Button
        color="light"
        disabled={isRootDir}
        onClick={goToParentDir}
        size="sm"
        title="Go to parent directory"
      >
        <i className="fa fa-level-up" />
      </Button>
    </ButtonGroup>
  );
}

function NewFileFolderButtons() {
  const { promptNewDir, promptNewFile } = useContext(FileManagerContext);
  return (
    <ButtonGroup className={classNames("mr-2", styles.ButtonGroup)}>
      <Button
        color="light"
        onClick={promptNewFile}
        size="sm"
        title="New file"
      >
        <span className="fa-stack" style={{ width: "13px" }}>
          <i className="fa fa-file-o fa-stack-1x"></i>
          <i className="fa fa-plus fa-stack-1x" style={{ top: "5px", left: "5px" }}></i>
        </span>
      </Button>
      <Button
        color="light"
        onClick={promptNewDir}
        size="sm"
        title="New directory"
      >
        <span className="fa-stack" style={{ width: "13px" }}>
          <i className="fa fa-folder-o fa-stack-1x"></i>
          <i className="fa fa-plus fa-stack-1x" style={{ top: "5px", left: "5px" }}></i>
        </span>
      </Button>
    </ButtonGroup>
  );
}

function UpDownloadButtons() {
  const { download, isFileSelected, upload } = useContext(FileManagerContext);
  return (
    <ButtonGroup className={classNames("mr-2", styles.ButtonGroup)}>
      <Button
        color="light"
        onClick={upload}
        size="sm"
        title="Upload"
      >
        <i className="fa fa-upload" />
      </Button>
      <Button
        color="light"
        disabled={!isFileSelected}
        onClick={download}
        size="sm"
        title="Download"
      >
        <i className="fa fa-download" />
      </Button>
    </ButtonGroup>
  );
}

function CopyPasteButtons() {
  const { copy, cut, paste } = useContext(FileManagerContext);
  return (
    <ButtonGroup className={classNames("mr-2", styles.ButtonGroup)}>
      <Button
        color="light"
        onClick={cut}
        size="sm"
        title="Cut"
      >
        <i className="fa fa-cut" />
      </Button>
      <Button
        color="light"
        onClick={copy}
        size="sm"
        title="Copy"
      >
        <i className="fa fa-copy" />
      </Button>
      <Button
        color="light"
        onClick={paste}
        size="sm"
        title="Paste"
      >
        <i className="fa fa-paste" />
      </Button>
    </ButtonGroup>
  );
}

function SelectionButtons() {
  const { toggleAllSelectedFiles } = useContext(FileManagerContext);
  return (
    <ButtonGroup className={classNames("mr-2", styles.ButtonGroup)}>
      <Button
        color="light"
        onClick={toggleAllSelectedFiles}
        size="sm"
        title="(Un)Select all"
      >
        <i className="fa fa-asterisk" />
      </Button>
    </ButtonGroup>
  );
}

function OperationsButtons() {
  const { del, edit, isFileSelected, rename, view } = useContext(FileManagerContext);
  return (
    <ButtonGroup className={classNames("mr-2", styles.ButtonGroup)}>
      <Button
        color="light"
        disabled={!isFileSelected}
        onClick={view}
        size="sm"
        title="View file"
      >
        <i className="fa fa-eye" />
      </Button>
      <Button
        color="light"
        disabled={!isFileSelected}
        onClick={edit}
        size="sm"
        title="Edit file"
      >
        <i className="fa fa-edit" />
      </Button>
      <Button
        className={styles.iconRename}
        color="light"
        onClick={rename}
        size="sm"
        title="Rename"
      >
        <i className="icon-rename" />
      </Button>
      <Button
        color="light"
        onClick={del}
        size="sm"
        title="Delete"
      >
        <i className="fa fa-trash" />
      </Button>
    </ButtonGroup>
  );
}

function TarballButtons() {
  const { extract, pack } = useContext(FileManagerContext);
  return (
    <ButtonGroup className={classNames("mr-2", styles.ButtonGroup)}>
      <Button
        color="light"
        onClick={pack}
        size="sm"
        title="Pack"
      >
        <i className="fa fa-compress" />
      </Button>
      <Button
        color="light"
        // XXX Better disability.
        // disabled={!isFileSelected}
        onClick={extract}
        size="sm"
        title="Extract"
      >
        <i className="fa fa-expand" />
      </Button>
    </ButtonGroup>
  );
}

function AppLinkButtons() {
  const { currentAbsDir } = useContext(FileManagerContext);
  return (
    <ButtonGroup className={classNames("mr-2", styles.ButtonGroup)}>
      <Button
        color="light"
        href={`/console/terminal?dir=${currentAbsDir}`}
        size="sm"
        style={{ lineHeight: 2 }}
        title="Open the current directory in Flight Console"
      >
        Open in console
      </Button>
      {/*
      <Button
        color="light"
        // disabled={!isFileSelected}
        onClick={() => {
          const DOM = window.DOM;
          const files = DOM.getAllFiles();
          const idx = DOM.getFilenames(files).findIndex((f) => f === '.flight-job-id');
          if (idx >= 0) {
            const idFile = files[idx];
            DOM.CurrentInfo.getData(idFile).then((_, content) => {
              console.log('content:', content);  // eslint-disable-line no-console
            });
          }
        }}
        size="sm"
      >
        Open in Flight Job
      </Button>
      */}
    </ButtonGroup>
  );
}

export default Toolbar;
