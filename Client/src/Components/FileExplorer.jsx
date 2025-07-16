import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, FolderOpen, Plus, Trash2 } from "lucide-react";
import LanguageIcon from "./LanguageIcon";
import ContextMenu from "./ContextMenu";

const FileNode = ({ item, onSelectFile, onContextMenu, level }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleRightClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e.pageX, e.pageY, item);
  };

  if (item.type === "folder") {
    return (
      <div>
        <div
          onClick={() => setIsOpen(!isOpen)}
          onContextMenu={handleRightClick}
          style={{ paddingLeft: `${level * 16}px` }}
          className="flex items-center gap-2 py-1.5 px-2 cursor-pointer rounded hover:bg-white/10 transition-colors"
        >
          {isOpen ? (
            <FolderOpen size={16} className="text-blue-400" />
          ) : (
            <Folder size={16} className="text-blue-400" />
          )}
          <span>{item.name}</span>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <FileTree
                items={item.children}
                onSelectFile={onSelectFile}
                onContextMenu={onContextMenu}
                level={level + 1}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelectFile(item.id)}
      onContextMenu={handleRightClick}
      style={{ paddingLeft: `${level * 16}px` }}
      className="flex items-center gap-2 py-1.5 px-2 cursor-pointer rounded hover:bg-white/10 transition-colors"
    >
      <LanguageIcon filename={item.name} />
      <span>{item.name}</span>
    </div>
  );
};

const FileTree = ({ items, onSelectFile, onContextMenu, level = 0 }) => {
  return (
    <div className="text-sm">
      {Object.values(items)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((item) => (
          <FileNode
            key={item.id}
            item={item}
            onSelectFile={onSelectFile}
            onContextMenu={onContextMenu}
            level={level}
          />
        ))}
    </div>
  );
};

const FileExplorer = ({
  fileTree,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onDeleteItem,
}) => {
  const [contextMenu, setContextMenu] = useState(null);

  const handleContextMenu = (x, y, item) => {
    setContextMenu({
      x,
      y,
      item,
      options: [
        {
          label: "Delete",
          icon: <Trash2 size={14} />,
          action: () => onDeleteItem(item.id),
          style: "danger",
        },
      ],
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800/50 p-2 flex flex-col">
      <div className="flex justify-between items-center mb-2 p-1">
        <h3 className="text-sm font-bold uppercase text-gray-400">Explorer</h3>
        <div className="flex gap-2">
          <button
            onClick={onCreateFile}
            className="text-gray-400 hover:text-white"
            title="New File"
          >
            <Plus size={18} />
          </button>
          {/* Folder creation can be added later */}
          {/* <button onClick={onCreateFolder} className="text-gray-400 hover:text-white" title="New Folder"><FolderPlus size={18} /></button> */}
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        {fileTree ? (
          <FileTree
            items={fileTree}
            onSelectFile={onSelectFile}
            onContextMenu={handleContextMenu}
          />
        ) : (
          <p className="text-gray-500 text-xs p-2">No files yet.</p>
        )}
      </div>
      {contextMenu && (
        <ContextMenu {...contextMenu} onClose={closeContextMenu} />
      )}
    </aside>
  );
};

export default FileExplorer;
