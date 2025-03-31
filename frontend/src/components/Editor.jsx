import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const Editor = ({ content, onChange, resetRemoteFlag }) => {
  // Initialize the editor without passing the content directly.
  const editor = useEditor({
    extensions: [StarterKit],
    content: "", // start with empty content; we'll update manually
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

  // Attach event listeners to clear the remote flag on various input-related events.
  useEffect(() => {
    if (editor) {
      const handleReset = () => {
        resetRemoteFlag();
      };

      const dom = editor.view.dom;
      // Attach multiple events to catch different user interactions:
      dom.addEventListener("keydown", handleReset);
      dom.addEventListener("keyup", handleReset);
      dom.addEventListener("cut", handleReset);
      dom.addEventListener("beforeinput", handleReset);
      dom.addEventListener("input", handleReset);

      return () => {
        dom.removeEventListener("keydown", handleReset);
        dom.removeEventListener("keyup", handleReset);
        dom.removeEventListener("cut", handleReset);
        dom.removeEventListener("beforeinput", handleReset);
        dom.removeEventListener("input", handleReset);
      };
    }
  }, [editor, resetRemoteFlag]);

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
