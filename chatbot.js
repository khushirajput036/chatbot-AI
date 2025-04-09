const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector("#file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const emojiToggleButton = document.querySelector("#emoji-picker");

const API_KEY = "AIzaSyDlPJhYxDRzzj2jhY6tIt25Wv3P9IL4oy4"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
};

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");
    const parts = [{ text: userData.message }];

    if (userData.file.data) {
        parts.push({
            inline_data: {
                data: userData.file.data,
                mime_type: userData.file.mime_type
            }
        });
    }

    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts }]
        })
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);
        const apiResponseText = data.candidates[0].content.parts[0].text || "No response.";
        messageElement.innerText = apiResponseText;
    } catch (error) {
        console.error(error);
        messageElement.innerText = error.message;
        messageElement.style.color = "#ff0000";
    } finally {
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        userData.message = null;
        userData.file = { data: null, mime_type: null };
        fileUploadWrapper.querySelector("img").style.display = "none";
    }
};

const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();

    if (!userData.message && !userData.file.data) return;

    let userMsg = `<div class="message-text">${userData.message || ""}`;
    if (userData.file.data) {
        userMsg += `<br><img src="data:${userData.file.mime_type};base64,${userData.file.data}" />`;
    }
    userMsg += `</div>`;

    const outgoingMessageDiv = createMessageElement(userMsg, "user-message");
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    messageInput.value = "";

    setTimeout(() => {
        const botMsg = `
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot">
					</div>
                    <div class="dot">
					</div>
                    <div class="dot">
					</div>
                </div>
            </div>`;
        const incomingMessageDiv = createMessageElement(botMsg, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);
        generateBotResponse(incomingMessageDiv);
    }, 500);
};

messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleOutgoingMessage(e);
    }
});

sendMessageButton.addEventListener("click", handleOutgoingMessage);

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64String = e.target.result.split(",")[1];
        userData.file = {
            data: base64String,
            mime_type: file.type
        };
        const previewImage = fileUploadWrapper.querySelector("img");
        previewImage.src = e.target.result;
        previewImage.style.display = "inline-block";
        fileInput.value = "";
    };
    reader.readAsDataURL(file);
});

fileCancelButton.addEventListener("click",()=>{
	 previewImg.src = "#";
  fileInput.value = "";
  fileUploadWrapper.classList.remove("file-uploaded");
})

//emoji

  const picker = new EmojiMart.Picker({
	  theme:"light"	,
	  skinTonePosition : "none",
	  previewPosition :"none",
	  onClickOutside: (e) => {
		  if(e.target.id === "emoji-picker"){
			  document.body.classList.toggle("show-emoji-picker")
		  }
		  else{
			   document.body.classList.remove("show-emoji-picker")
		  }
	  }
  })

document.querySelector(".chat-form").appendChild(picker)
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
