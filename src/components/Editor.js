// 引入富文本编辑器库react-quill
import ReactQuill from "react-quill";
import React, { Component } from "react";

export default class Editor extends Component {
  render() {
    return (
      <ReactQuill
        {...this.props}
        modules={Editor.modules}
        formats={Editor.formats}
      />
    );
  }
}
/*
 * 允许在编辑器中使用的格式的白名单
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
Editor.formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
];

/*
 * 控制富文本编辑器的工具栏选项
 * Quill modules to attach to editor
 * See https://quilljs.com/docs/modules/ for complete options
 */
Editor.modules = {
  toolbar: [
    [{ font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link", "image", "video"],
    ["clean"],
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
};
