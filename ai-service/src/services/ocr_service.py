import io
import fitz  # PyMuPDF
import numpy as np
from PIL import Image
from typing import TYPE_CHECKING, Optional

# ---------------------------------------------------------------------------
# EasyOCR / PyTorch are imported lazily to avoid a DLL startup crash on
# Windows machines that are missing the Visual C++ 2022 Redistributable.
# The import only happens on the first actual OCR request, not at server boot.
# ---------------------------------------------------------------------------
if TYPE_CHECKING:
    import easyocr  # noqa: F401 – type hints only

_reader: Optional[object] = None


def get_reader():
    """Return a singleton EasyOCR reader (CPU mode, lazy-initialised)."""
    global _reader
    if _reader is None:
        try:
            import easyocr  # deferred import
        except (ImportError, OSError) as exc:
            raise RuntimeError(
                "EasyOCR / PyTorch could not be loaded. "
                "On Windows, install the Visual C++ 2022 Redistributable: "
                "https://aka.ms/vs/17/release/vc_redist.x64.exe\n"
                f"Original error: {exc}"
            ) from exc
        _reader = easyocr.Reader(["en"], gpu=False, verbose=False)
    return _reader


def extract_text_from_image_bytes(image_bytes: bytes) -> str:
    """Extract text from raw image bytes using EasyOCR."""
    reader = get_reader()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)
    results = reader.readtext(image_np, detail=0, paragraph=True)
    return "\n".join(results)


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Convert each PDF page to an image then OCR with EasyOCR."""
    reader = get_reader()
    extracted_pages: list[str] = []

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    for page_num in range(len(doc)):
        page = doc[page_num]
        # Render at 2x zoom for better OCR accuracy
        mat = fitz.Matrix(2, 2)
        pix = page.get_pixmap(matrix=mat)
        img_bytes = pix.tobytes("png")
        image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        image_np = np.array(image)
        results = reader.readtext(image_np, detail=0, paragraph=True)
        page_text = "\n".join(results)
        extracted_pages.append(f"--- Page {page_num + 1} ---\n{page_text}")

    doc.close()
    return "\n\n".join(extracted_pages)


def extract_text(file_bytes: bytes, filename: str) -> str:
    """Auto-detect file type and extract text."""
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return extract_text_from_pdf_bytes(file_bytes)
    else:
        # Treat as image (jpg, jpeg, png, webp, bmp, tiff)
        return extract_text_from_image_bytes(file_bytes)

