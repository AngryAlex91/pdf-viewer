# LLM - PDF Annotater

At Datazora one of our largest market segments is corporate researchers. 
These researchers frequently need to find/read/understand large PDF documents. 
Datazora helps this process by collecting/aggregating/extracting these documents, and then providing an easy UI/API to find and understand them.

## Background
Kiji already allows users to ask questions about a PDF in the current UI. 
The user types into a textbox, their question along with all of the text in the PDF gets sent to an LLM.
The LLM response is then streamed back and presented to the user.

We frequently get requests from users that want the "source" (references) of the LLM's answer. 
"Where in the PDF did the LLM actually find this answer".

## Task

Create a small, single page web app that allows a user to query a PDF, and then annotate the PDF with the references returned from an LLM. 

The UX flow looks like this: 
1. User is presented with 2 components on a page, a textbox, and an embedded PDF. 
2. User asks a question about the PDF. 
3. LLM API call is generated (this will be mocked).
4. LLM response is returned and the PDF gets annotated with the sources provided in LLM response.

## Requirements 

I would like you to add a state management system (Vuex or Pinia) to the project.
I would like you to use https://github.com/mozilla/pdf.js They recently have added more tools for PDF annotations.
You can add any other libraries you like, but nothing is mandatory besides Vue.js, Vuex/Pinia, and PDF.js
 
I don't want this project to be about LLMs, so I have generated 3 mocked responses in /src/api.ts
I have placed 3 PDFs, along with their extracted text into /src/data




