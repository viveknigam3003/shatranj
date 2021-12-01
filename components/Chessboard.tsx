import { Box, GridItem } from '@chakra-ui/layout'
import React from 'react'

interface Props {
    
}

const Chessboard = (props: Props) => {
    return (
        <GridItem colStart={3} colSpan={5}>
          <Box width="600px" height="600px" bg="orange">
            Chessboard
          </Box>
        </GridItem>
    )
}

export default Chessboard
