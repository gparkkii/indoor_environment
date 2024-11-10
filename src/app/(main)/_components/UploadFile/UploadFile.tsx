import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import styles from './UploadFile.module.css';
import CsvIcon from '@/assets/icons/csv.svg';
import SelectedFile from '../SelectedFile/SelectedFile';
import Image from 'next/image';
import CloseIcon from '@/assets/icons/cancel.svg';
import NextIcon from '@/assets/icons/ic_arrow_next.svg';
import PrevIcon from '@/assets/icons/ic_arrow_prev.svg';
import Button from '../Button/Button';

interface UploadFileProps {
    file: File | null;
    handleFile: (file: File) => void;
    deleteFile: () => void;
    getSampleFile: () => void;
}

const requiredHeaders = ['tm', 'temp', 'humi'];
const optionalHeaders = ['stnId'];

const rowsPerPage = 100; // Display 100 rows per page
export default function UploadFile({
    file,
    handleFile,
    deleteFile,
    getSampleFile,
}: UploadFileProps) {
    const [open, setOpen] = useState(false);
    const [previewData, setPreviewData] = useState<{ [key: string]: string }[]>(
        []
    );
    const [tableHeaders, setTableHeaders] = useState<string[]>([]);
    const [tableValues, setTableValues] = useState<{ [key: string]: string }[]>(
        []
    );
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    function validateHeaders(headers: string[]): string | null {
        // 필수 열 제목이 모두 포함되어 있는지 확인
        const missingHeaders = requiredHeaders.filter(
            (header) => !headers.includes(header)
        );

        if (missingHeaders.length > 0) {
            return `경고! 변환이 제대로 되지 않습니다.\n누락된 열 제목: ${missingHeaders.join(', ')}`;
        }

        return null;
    }

    const onClose = useCallback(() => {
        if (file) {
            const isValid = validateHeaders(tableHeaders);
            if (isValid) {
                const userConfirmed = confirm(
                    `${isValid}\n그래도 창을 닫으시겠습니까?`
                );
                if (userConfirmed) {
                    setOpen(false);
                    setCurrentPage(1);
                }
            } else {
                setOpen(false);
                setCurrentPage(1);
            }
        } else {
            setOpen(false);
            setCurrentPage(1);
        }
    }, [file, tableHeaders]);

    const handleSample = async () => {
        await getSampleFile();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDelete = () => {
        deleteFile();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setPreviewData([]);
    };

    const parseCSV = (csv: string) => {
        const lines = csv.trim().split('\n');
        if (lines.length === 0) return { headers: [], values: [] };

        const headers = lines[0].split(',').map((header) => header.trim());
        const values = lines.slice(1).map((line) => {
            const cells = line.split(',').map((value) => value.trim());
            const row: { [key: string]: string } = {};

            headers.forEach((header, index) => {
                row[header] = cells[index] || ''; // Handle cases where cells may be missing
            });
            return row;
        });

        return { headers, values };
    };

    const handleFileUpload = (
        file: File
    ): Promise<{
        headers: string[];
        values: {
            [key: string]: string;
        }[];
    }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const text = e.target?.result as string;
                const parsedData = parseCSV(text);
                resolve(parsedData);
            };
            reader.onerror = function (error) {
                reject(error);
            };
            reader.readAsText(file);
        });
    };

    const getPreview = useCallback(async (file: File) => {
        if (file) {
            const parsedData = await handleFileUpload(file);
            setTableHeaders(parsedData.headers);
            setTableValues(parsedData.values);
            setCurrentPage(1);
        }
    }, []);

    useEffect(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        setPreviewData(tableValues.slice(startIndex, endIndex));
    }, [tableValues, currentPage]);

    const totalPages = useMemo(
        () => Math.ceil(tableValues.length / rowsPerPage),
        [tableValues]
    );

    const handlePreviousPage = useCallback(
        (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.preventDefault();
            if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        },
        [currentPage]
    );

    const handleNextPage = useCallback(
        (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                setCurrentPage(currentPage + 1);
            }
        },
        [currentPage, totalPages]
    );

    return (
        <div className={styles.filebox}>
            <SelectedFile
                htmlFor=""
                filename={file?.name}
                icon={CsvIcon}
                handleDelete={handleDelete}
                onClick={() => {
                    setOpen(true);
                }}
                placeholder="측정 데이터를 선택해주세요."
            />
            <div className={styles['button-box']}>
                <button type="button" onClick={handleSample}>
                    샘플 데이터
                </button>
            </div>
            {open && (
                <div id="modal" className={styles.modal}>
                    <div className={styles.wrapper}>
                        <header className={styles.header}>
                            <p>파일 업로드</p>
                            <button type="button" onClick={onClose}>
                                <Image
                                    src={CloseIcon}
                                    alt="close"
                                    width={24}
                                    height={24}
                                />
                            </button>
                        </header>
                        <div className={styles.upload}>
                            <div className={styles['upload-filename']}>
                                <div className={styles['upload-input']}>
                                    <SelectedFile
                                        htmlFor="upload-file"
                                        filename={file?.name}
                                        icon={CsvIcon}
                                        handleDelete={handleDelete}
                                        placeholder="측정 데이터를 선택해주세요."
                                    />
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                id="upload-file"
                                type="file"
                                accept=".csv"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        handleFile(e.target.files[0]);
                                        getPreview(e.target.files[0]);
                                    }
                                }}
                            />
                            {previewData.length > 0 ? (
                                <>
                                    <div className={styles.preview}>
                                        <table
                                            className={styles['preview-table']}
                                        >
                                            <thead>
                                                <tr>
                                                    <th>No.</th>
                                                    {tableHeaders.map(
                                                        (header, index) => (
                                                            <th key={index}>
                                                                {header}
                                                            </th>
                                                        )
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewData.map(
                                                    (row, rowIndex) => (
                                                        <tr key={rowIndex}>
                                                            <td
                                                                style={{
                                                                    width: '40px',
                                                                }}
                                                            >
                                                                {rowIndex + 1}
                                                            </td>
                                                            {tableHeaders.map(
                                                                (header) => (
                                                                    <td
                                                                        key={
                                                                            header
                                                                        }
                                                                    >
                                                                        {
                                                                            row[
                                                                                header
                                                                            ]
                                                                        }
                                                                    </td>
                                                                )
                                                            )}
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className={styles.pagination}>
                                        <p>
                                            행 수:{' '}
                                            <strong>
                                                {tableValues.length}
                                            </strong>
                                        </p>
                                        <div className={styles.nav}>
                                            <button
                                                onClick={handlePreviousPage}
                                                disabled={currentPage === 1}
                                            >
                                                <Image
                                                    src={PrevIcon}
                                                    width={20}
                                                    height={20}
                                                    alt="prev"
                                                />
                                            </button>
                                            <span>
                                                <strong>{currentPage}</strong>{' '}
                                                of {totalPages}
                                            </span>
                                            <button
                                                onClick={handleNextPage}
                                                disabled={
                                                    currentPage === totalPages
                                                }
                                            >
                                                <Image
                                                    src={NextIcon}
                                                    width={20}
                                                    height={20}
                                                    alt="next"
                                                />
                                            </button>
                                        </div>
                                        <div>
                                            <Button
                                                style={{
                                                    width: 124,
                                                    height: 40,
                                                    fontSize: 14,
                                                }}
                                                onClick={onClose}
                                            >
                                                계속 진행하기 →
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className={styles.nodata}>
                                    불러온 파일이 없습니다.
                                    <p>
                                        ※ <b>tm, temp, humi, stnId(optional)</b>{' '}
                                        항목이 포함되어 있는 파일을
                                        불러와주세요.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
