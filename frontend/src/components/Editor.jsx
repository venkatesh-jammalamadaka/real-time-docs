import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const Editor = ({ content, onChange }) => {
  // Initialize the editor with empty content. We control updates via our useEffect.
  const editor = useEditor({
    extensions: [StarterKit],
    content: "", // start empty so as not to reinitialize on every keystroke
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      console.log("Editor onUpdate:", html);
      onChange(html);
    },
  });

  // When the remoteContent prop changes, update the editor if it is different.
  useEffect(() => {
    if (editor && content && content !== editor.getHTML()) {
      console.log("Updating editor content to:", content);
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
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
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
