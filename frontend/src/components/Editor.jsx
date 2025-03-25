import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const Editor = ({ content, onChange }) => {
  // Initialize the editor with an empty content so that it doesn’t reinitialize on every keystroke.
  const editor = useEditor({
    extensions: [StarterKit],
    content: "", // start empty
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // When a remote update comes in, update the editor's content without forcing a full re-init.
  useEffect(() => {
    if (editor && content && content !== editor.getHTML()) {
      // The second argument (false) tells Tiptap not to reset the cursor if possible.
      editor.commands.setContent(content, false);
    }
  }, [editor, content]);

  if (!editor) return <p>Loading editor...</p>;

  return (
    <div className="editor-container">
      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
