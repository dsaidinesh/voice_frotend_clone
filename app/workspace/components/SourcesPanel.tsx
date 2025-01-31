"use client"

import { useState, useRef, useEffect } from "react"
import { Box, VStack, Heading, Input, Button, Icon, Text, useColorModeValue, useToast, Flex, Checkbox, IconButton, InputGroup, InputLeftElement } from "@chakra-ui/react"
import { ChevronLeftIcon } from "@chakra-ui/icons"
import { FiFile, FiUpload, FiTrash2, FiSearch } from "react-icons/fi"
import { uploadDocument, Document, getDocuments, deleteDocument } from "@/app/utils/api"

interface SourcesPanelProps {
  onDocumentSelect: (documentIds: string[]) => void;
}

export default function SourcesPanel({ onDocumentSelect }: SourcesPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const hoverBgColor = useColorModeValue("gray.50", "gray.700")
  const selectedBgColor = useColorModeValue("blue.50", "blue.900")

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    if (onDocumentSelect && selectedDocuments.size >= 0) {
      const selectedArray = Array.from(selectedDocuments)
      onDocumentSelect(selectedArray)
    }
  }, [selectedDocuments])

  const fetchDocuments = async () => {
    try {
      const docs = await getDocuments()
      setDocuments(docs)
    } catch (error) {
      toast({
        title: "Error fetching documents",
        description: error instanceof Error ? error.message : "Failed to load documents",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      await uploadDocument(file)
      toast({
        title: "Document uploaded successfully",
        status: "success",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Failed to upload document",
        description: "Please try again",
        status: "error",
        duration: 3000,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(docId)) {
        newSelection.delete(docId)
      } else {
        newSelection.add(docId)
      }
      return newSelection
    })
  }

  const handleDeleteDocument = async (docId: string) => {
    try {
      await deleteDocument(docId)
      // Remove from selected documents if it was selected
      setSelectedDocuments(prev => {
        const newSelection = new Set(prev)
        newSelection.delete(docId)
        if (onDocumentSelect) {
          onDocumentSelect(Array.from(newSelection))
        }
        return newSelection
      })
      // Remove from documents list
      setDocuments(prev => prev.filter(doc => doc.id !== docId))
      toast({
        title: "Document deleted",
        description: "The document has been removed successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: "Error deleting document",
        description: error instanceof Error ? error.message : "Failed to delete document",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isCollapsed) {
    return (
      <VStack 
        w="16" 
        bg={bgColor} 
        p={2} 
        borderRight="1px" 
        borderColor={borderColor} 
        align="center"
        position="fixed"
        left={0}
        top="16"
        bottom={0}
        zIndex={10}
      >
        <Button variant="ghost" onClick={() => setIsCollapsed(false)} mb={4}>
          <ChevronLeftIcon />
        </Button>
        {documents.map((doc) => (
          <Box key={doc.id} position="relative" w="full">
            <Button 
              variant="ghost" 
              p={2} 
              mb={2}
              w="full"
              bg={selectedDocuments.has(doc.id) ? selectedBgColor : undefined}
              onClick={() => toggleDocumentSelection(doc.id)}
              position="relative"
            >
              <Icon as={FiFile} />
              {selectedDocuments.has(doc.id) && (
                <Box position="absolute" bottom="0" right="0" w="2" h="2" bg="green.500" rounded="full" />
              )}
            </Button>
          </Box>
        ))}
      </VStack>
    )
  }

  return (
    <Box
      h="full"
      borderRight="1px"
      borderColor={borderColor}
      bg={bgColor}
      display="flex"
      flexDirection="column"
    >
      {/* Header */}
      <Box p={4} borderBottom="1px" borderColor={borderColor}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Sources
        </Text>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search documents"
            variant="filled"
            size="sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </Box>

      {/* Document List */}
      <VStack
        flex="1"
        overflowY="auto"
        spacing={0}
        align="stretch"
        pb={2}
      >
        {isLoading ? (
          <Text color="gray.500">Loading documents...</Text>
        ) : filteredDocuments.length === 0 ? (
          <Text color="gray.500">No documents found</Text>
        ) : (
          filteredDocuments.map((doc) => (
            <Flex
              key={doc.id}
              align="center"
              p={2}
              rounded="md"
              cursor="pointer"
              bg={selectedDocuments.has(doc.id) ? selectedBgColor : undefined}
              _hover={{ 
                bg: selectedDocuments.has(doc.id) ? selectedBgColor : hoverBgColor,
                '& .delete-button': {
                  opacity: 1,
                  visibility: 'visible'
                }
              }}
              position="relative"
              onClick={() => toggleDocumentSelection(doc.id)}
            >
              <Icon as={FiFile} mr={2} />
              <Text flex={1} noOfLines={1}>{doc.title}</Text>
              <Flex align="center">
                <IconButton
                  aria-label="Delete document"
                  icon={<Icon as={FiTrash2} />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  className="delete-button"
                  opacity={0}
                  visibility="hidden"
                  transition="all 0.2s"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteDocument(doc.id)
                  }}
                  _hover={{
                    bg: 'red.100'
                  }}
                />
                <Checkbox 
                  isChecked={selectedDocuments.has(doc.id)}
                  onChange={() => toggleDocumentSelection(doc.id)}
                  colorScheme="blue"
                  ml={2}
                  onClick={(e) => e.stopPropagation()}
                />
              </Flex>
            </Flex>
          ))
        )}
      </VStack>

      {/* Upload Button */}
      <Box p={4} borderTop="1px" borderColor={borderColor}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".pdf"
          onChange={handleFileUpload}
        />
        <Button
          leftIcon={<FiUpload />}
          colorScheme="brand"
          variant="outline"
          size="sm"
          width="full"
          onClick={handleUploadClick}
          isLoading={isUploading}
          loadingText="Uploading..."
        >
          Upload PDF
        </Button>
      </Box>
    </Box>
  )
}

