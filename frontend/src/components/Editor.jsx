import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Plugin } from "prosemirror-state";

const Editor = ({ content, onChange, resetRemoteFlag }) => {
  // Define a ProseMirror plugin that resets the remote flag on every transaction.
  const remoteFlagPlugin = new Plugin({
    appendTransaction(transactions, oldState, newState) {
      // Call resetRemoteFlag for every transaction.
      resetRemoteFlag();
      return null;
    },
  });

  // Initialize the editor. We add remoteFlagPlugin along with StarterKit.
  const editor = useEditor({
    extensions: [StarterKit, remoteFlagPlugin],
    content: "", // Start with empty content; remote content is set later.
    onUpdate: ({ editor }) => {
      console.log("update at editor");
      onChange(editor.getHTML());
    },
  });

  // Update the editor's content when remote content changes.
  useEffect(() => {
    if (editor && content && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [editor, content]);

  if (!editor) return <p>Loading editor...</p>;

  return (
    <div>
      {/* Toolbar */}
      <div className="editor-toolbar">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()}>
          Underline
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>
        <button onClick={() => editor.chain().focus().setParagraph().run()}>
          Paragraph
        </button>
      </div>

      {/* Editor Content */}
      <div className="editor-container">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Editor;
