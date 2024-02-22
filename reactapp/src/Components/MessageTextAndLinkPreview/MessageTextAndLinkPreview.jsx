import React, {useState,useEffect,useMemo } from 'react';
import DOMPurify from 'dompurify';
import { getLinkPreview } from '../../Utilities/chatFunctions';
import "./MessageTextAndLinkPreview.scss"

function MessageTextAndLinkPreview({ content }) {
    const linkRegex = /(http[s]?:\/\/[^\s]+)/g;
    const [linkToPreview, setLinkToPreview] = useState('');
    const [previewData, setPreviewData] = useState(null);
    const [hasLink, setHasLink] = useState(false);

    const transformedContent = useMemo(() => {
        return hasLink ? DOMPurify.sanitize(transformTextWithLinks(content)) : content;
    }, [content, hasLink]);

    function transformTextWithLinks(text) {
        const transformedText = text.replace(linkRegex, (match) => {
            return `<a href="${match}" target="_blank">${match}</a>`;
        });
        return transformedText;
    }

    const handleLinkClick = (e) => {
        e.stopPropagation();
        window.open(linkToPreview, '_blank');
    }

    useEffect(() => {
        const fetchLinkData = async () => {
            try {
                if (linkToPreview && hasLink) {
                    const data = await getLinkPreview(linkToPreview);
                    setPreviewData(data);
                }
            } catch (error) {
                console.error('Error fetching link preview:', error);
            }
        };

        fetchLinkData();
    }, [linkToPreview]);

    useEffect(() => {
        const matches = content.match(linkRegex);
        if (matches) {
            setLinkToPreview(matches[0]);
            setHasLink(true);
        } else {
            setHasLink(false);
        }
    }, [content]);

    useEffect(() => {
        console.log(previewData);
    }, [previewData])

    return (
        <>
            <p className="MessageContent" dangerouslySetInnerHTML={{ __html: transformedContent }} />
            {previewData && hasLink && (
                <div className="link-preview-container" onClick={(e)=>handleLinkClick(e) }>
                    <h3 className="link-preview-title">{previewData.title}</h3>
                    <p className="link-preview-description">{previewData.description}</p>
                    <img className="link-preview-image" src={previewData.image} alt="Preview" />
                </div>
            )}
        </>
    );
}

export default MessageTextAndLinkPreview;