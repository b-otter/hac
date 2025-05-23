import Styles from "./filelayaut.module.css"
import { useState } from "react";
import type { ChangeEvent } from "react";

function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  return (
    <div>
      <input
        type="file"
        id="file-upload" 
        onChange={handleFileChange}
        style={{ display: "none" }} 
      />

      <label
        className={Styles.upload__button}
        htmlFor="file-upload" 
      >
        Загрузить данные
      </label>

      {selectedFile && (
        <p>Имя: {selectedFile.name}</p>
      )}
    </div>
  );
}

export default FileUpload;