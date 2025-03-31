import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const Editor = ({ content, onChange }) => {
  // Initialize the editor without passing the content directly,
  // so we can manually update it via setContent().
  const editor = useEditor({
    extensions: [StarterKit],
    content: "", // start with empty content
    onUpdate: ({ editor }) => {
      console.log("update at editor")
      onChange(editor.getHTML());
    },
  });

  // Update the editor content if a remote update is received
  useEffect(() => {
    if (editor && content && content !== editor.getHTML()) {
      // Update content without resetting the cursor (if possible)
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
